import React, { useState, useEffect, useCallback } from 'react';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import { GuardiaModuloPlan } from '../components/GuardiaModuloPlan';
import { useNavigate } from 'react-router-dom';
import {
  consultarDashboardResumen,
  filtrarClimaEmocionalPorZonas,
  exportarReporteAnalitico,
} from '../services/apiInstitutional';
import {
  DashboardInstitucionalResumenRespuesta,
  ZonaTerritorialAnaliticaDto,
} from '../types/institutional';
import {
  BarChart3,
  MapPin,
  Users,
  ShieldCheck,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Loader2,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { IconoEmocionLucide } from '../components/IconoEmocionLucide';

export type SeccionAnalitica =
  | 'INDICADORES_CLAVE'
  | 'FILTRADO_ZONAS'
  | 'EXPORTACION_REPORTES';

export const DashboardInstitucionalPage: React.FC = () => {
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

  // Control de navegación lateral
  const [seccionActiva, setSeccionActiva] = useState<SeccionAnalitica>('INDICADORES_CLAVE');

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<DashboardInstitucionalResumenRespuesta | null>(null);

  // Estados de filtros territoriales (<<extend>> MOD_FILTROS_TERRITORIALES)
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('');
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string>('TODAS');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('ULTIMAS_24_HORAS');
  const [zonasFiltradas, setZonasFiltradas] = useState<ZonaTerritorialAnaliticaDto[]>([]);
  const [filtrando, setFiltrando] = useState<boolean>(false);

  // Estados de exportación (MOD_EXPORTACION_REPORTES)
  const [exportando, setExportando] = useState<boolean>(false);
  const [mensajeExportacion, setMensajeExportacion] = useState<string | null>(null);
  const [navegandoRuta, setNavegandoRuta] = useState<'renovar' | 'suscripcion' | 'catalogo' | null>(null);

  const cargarResumen = useCallback(async () => {
    if (!sesion?.tokenAcceso) return;
    setCargando(true);
    setError(null);
    try {
      const data = await consultarDashboardResumen(sesion.tokenAcceso, periodoSeleccionado);
      setResumen(data);
      setZonasFiltradas(data.resumenZonas || []);
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(apiErr.mensaje || 'Error al cargar el resumen del dashboard analítico.');
    } finally {
      setCargando(false);
    }
  }, [sesion?.tokenAcceso, periodoSeleccionado]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const aplicarFiltrosTerritoriales = async () => {
    if (!sesion?.tokenAcceso) return;
    setFiltrando(true);
    setError(null);
    try {
      const respuesta = await filtrarClimaEmocionalPorZonas(sesion.tokenAcceso, {
        zonaManualId: zonaSeleccionada || undefined,
        emocion: emocionSeleccionada !== 'TODAS' ? emocionSeleccionada : undefined,
        periodo: periodoSeleccionado,
      });
      setZonasFiltradas(respuesta.zonasFiltradas || []);
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(apiErr.mensaje || 'No fue posible aplicar los filtros territoriales.');
    } finally {
      setFiltrando(false);
    }
  };

  const ejecutarExportacion = async () => {
    if (!sesion?.tokenAcceso) return;
    setExportando(true);
    setMensajeExportacion(null);
    try {
      const reporte = await exportarReporteAnalitico(
        sesion.tokenAcceso,
        zonaSeleccionada || undefined
      );

      // Descargar como archivo JSON
      const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `almara_reporte_analitico_${reporte.razonSocial.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMensajeExportacion(`Reporte analítico generado y descargado exitosamente (${reporte.totalZonasExportadas} zonas exportadas).`);
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(apiErr.mensaje || 'Error al exportar el reporte institucional.');
    } finally {
      setExportando(false);
    }
  };

  if (!sesion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner condicional de renovación solo si la suscripción requiere pago o expiró */}
        {sesion.requiereRenovacion && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 text-2xl font-bold flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-base">Suscripción Pendiente de Renovación</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Su suscripción actual requiere activación o renovación para habilitar filtros avanzados por zonas de Popayán y exportación de reportes.
                </p>
              </div>
            </div>
            <button
              disabled={navegandoRuta !== null}
              aria-busy={navegandoRuta === 'renovar'}
              onClick={() => {
                setNavegandoRuta('renovar');
                navigate('/institutional/planes');
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
            >
              {navegandoRuta === 'renovar' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Abriendo Planes...</span>
                </>
              ) : (
                <span>Renovar / Mejorar Plan</span>
              )}
            </button>
          </div>
        )}

        {/* Tarjeta de Cabecera Corporativa Unificada con Estado y Acciones Clave */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 text-[11px] font-bold tracking-widest uppercase rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                  Panel Analítico Institucional
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>K-Anonimato Activo (k ≥ 5)</span>
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-sky-600" />
                  <span>Observatorio Popayán H3</span>
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  sesion.requiereRenovacion
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {sesion.requiereRenovacion ? 'RENOVACIÓN PENDIENTE' : `ESTADO: ${sesion.estadoSuscripcion || 'ACTIVA'}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {resumen?.razonSocial || sesion.razonSocial}
              </h1>

              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Cuenta Oficial: <strong className="font-mono text-slate-800 font-medium">{sesion.correoInstitucional}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Plan Activo: <strong className="font-bold text-sky-700">{resumen?.codigoPlanActivo || sesion.codigoPlan}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Zonas Territoriales: <strong className="text-slate-700 font-medium">{resumen?.totalZonasMonitoreadas ?? 15} Celdas H3</strong></span>
              </p>
            </div>

            {/* Acciones Rápidas Unificadas */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={cargarResumen}
                disabled={cargando}
                aria-busy={cargando}
                title="Actualizar datos del observatorio"
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
                <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
              </button>

              <button
                disabled={navegandoRuta !== null}
                aria-busy={navegandoRuta === 'suscripcion'}
                onClick={() => {
                  setNavegandoRuta('suscripcion');
                  navigate('/institutional/mi-suscripcion');
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
              >
                {navegandoRuta === 'suscripcion' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <span>Mi Suscripción</span>
                )}
              </button>

              <button
                disabled={navegandoRuta !== null}
                aria-busy={navegandoRuta === 'catalogo'}
                onClick={() => {
                  setNavegandoRuta('catalogo');
                  navigate('/institutional/planes');
                }}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
              >
                {navegandoRuta === 'catalogo' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <span>Catálogo SaaS</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* DISTRIBUCIÓN PRINCIPAL CON MENÚ LATERAL IZQUIERDO Y PANEL DE CONTENIDO */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MENÚ LATERAL IZQUIERDO */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-2 lg:sticky lg:top-24">
              <div className="px-2 py-1.5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Módulos Analíticos
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    Menú del Panel
                  </h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              </div>

              {/* Botón 1: Indicadores Clave */}
              <button
                type="button"
                id="btn-nav-indicadores-clave"
                onClick={() => setSeccionActiva('INDICADORES_CLAVE')}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  seccionActiva === 'INDICADORES_CLAVE'
                    ? 'bg-sky-50/80 border-2 border-sky-500 text-sky-950 shadow-sm shadow-sky-500/5'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                    seccionActiva === 'INDICADORES_CLAVE'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Indicadores Clave</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        seccionActiva === 'INDICADORES_CLAVE'
                          ? 'bg-sky-200/60 text-sky-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Popayán
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Inteligencia Emocional Urbana
                  </p>
                </div>
              </button>

              {/* Botón 2: Filtrado y Zonas */}
              <button
                type="button"
                id="btn-nav-filtrado-zonas"
                onClick={() => setSeccionActiva('FILTRADO_ZONAS')}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  seccionActiva === 'FILTRADO_ZONAS'
                    ? 'bg-indigo-50/80 border-2 border-indigo-500 text-indigo-950 shadow-sm shadow-indigo-500/5'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                    seccionActiva === 'FILTRADO_ZONAS'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Filtrado y Análisis</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        seccionActiva === 'FILTRADO_ZONAS'
                          ? 'bg-indigo-200/60 text-indigo-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Zonas H3
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Segmentación Territorial
                  </p>
                </div>
              </button>

              {/* Botón 3: Exportación de Reportes */}
              <button
                type="button"
                id="btn-nav-exportacion-reportes"
                onClick={() => setSeccionActiva('EXPORTACION_REPORTES')}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  seccionActiva === 'EXPORTACION_REPORTES'
                    ? 'bg-emerald-50/80 border-2 border-emerald-500 text-emerald-950 shadow-sm shadow-emerald-500/5'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                    seccionActiva === 'EXPORTACION_REPORTES'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Exportación</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        seccionActiva === 'EXPORTACION_REPORTES'
                          ? 'bg-emerald-200/60 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Reportes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Reportes Oficiales JSON
                  </p>
                </div>
              </button>

              {/* Widget de Estado de Plataforma en el Menú Lateral */}
              <div className="pt-4 mt-3 border-t border-slate-100 space-y-2.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Nivel de Plan:</span>
                  <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 text-[10px]">
                    {resumen?.codigoPlanActivo || sesion.codigoPlan}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Privacidad k-anonimato:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[10px]">
                    k &ge; 5
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Zonas de Popayán:</span>
                  <span className="font-bold text-slate-800">
                    {resumen?.totalZonasMonitoreadas || 15} Sectores H3
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* CONTENIDO DEL PANEL ANALÍTICO SEGÚN LA SECCIÓN SELECCIONADA */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* ================================================================ */}
            {/* SECCIÓN 1: INDICADORES CLAVE DE INTELIGENCIA EMOCIONAL URBANA */}
            {/* ================================================================ */}
            {seccionActiva === 'INDICADORES_CLAVE' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-sky-600" />
                      Indicadores Clave de Inteligencia Emocional Urbana (Popayán)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monitoreo agregado y métricas clave de la atmósfera ciudadana con diferencial k-anonimato.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hidden sm:inline-block">
                    Popayán En Vivo
                  </span>
                </div>

                {/* Grid de KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1: Clima Predominante */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Clima Predominante</span>
                      <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-base font-bold flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-3 truncate">
                      {resumen?.emocionPredominanteCiudad || 'Cargando...'}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Intensidad: {resumen?.intensidadPromedioCiudad || 0} / 5.0
                    </p>
                  </div>

                  {/* KPI 2: Zonas Monitoreadas */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Zonas Monitoreadas</span>
                      <span className="p-2 bg-sky-50 text-sky-700 rounded-xl text-base">
                        <MapPin className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-3">
                      {resumen?.totalZonasMonitoreadas || 0} Zonas H3
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Sectores urbanos de Popayán</p>
                  </div>

                  {/* KPI 3: Zonas con Datos Suficientes */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Zonas con Datos ({`k >= 5`})</span>
                      <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl text-base">
                        <Users className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-3">
                      {resumen?.zonasConDatosSuficientes || 0} Zonas
                    </div>
                    <p className="text-[11px] text-indigo-700 font-medium mt-1">Protección comunitaria</p>
                  </div>

                  {/* KPI 4: Zonas en Reserva de Privacidad */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">En Reserva de Privacidad</span>
                      <span className="p-2 bg-amber-50 text-amber-700 rounded-xl text-base">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-3">
                      {resumen?.zonasEnReservaPrivacidad || 0} Zonas
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">{`< 5 vecinos (protegidos)`}</p>
                  </div>
                </div>

                {/* Desglose Porcentual Global de Emociones en Popayán */}
                {resumen?.distribucionGlobalCiudad && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span>Distribución Emocional de la Ciudad de Popayán</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">Fórmula Hamilton-Hare</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {resumen.distribucionGlobalCiudad.map((ind) => (
                        <div
                          key={ind.idEmocion}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${ind.codigoHexColor}18`, borderColor: `${ind.codigoHexColor}35` }}>
                              <IconoEmocionLucide
                                icono={ind.icono}
                                idEmocion={ind.idEmocion}
                                color={ind.codigoHexColor}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-lg font-black text-slate-900">{ind.porcentajeGlobal}%</span>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs font-bold text-slate-700">{ind.nombreEmocion}</div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${ind.porcentajeGlobal}%`,
                                  backgroundColor: ind.codigoHexColor,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Atajos Rápidos a Otras Secciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => setSeccionActiva('FILTRADO_ZONAS')}
                    className="p-5 bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl transition shadow-sm cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                        <MapPin className="w-4 h-4" />
                        <span>Filtrado Territorial H3</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Explora los 15 sectores urbanos y filtra por emoción o ventana temporal.
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                  </div>

                  <div
                    onClick={() => setSeccionActiva('EXPORTACION_REPORTES')}
                    className="p-5 bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl transition shadow-sm cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <Download className="w-4 h-4" />
                        <span>Exportación de Reportes</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Descarga el dataset oficial en JSON para análisis territorial y políticas públicas.
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECCIÓN 2: FILTRADO Y ANÁLISIS POR ZONAS TERRITORIALES */}
            {/* ================================================================ */}
            {seccionActiva === 'FILTRADO_ZONAS' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      Filtrado y Análisis por Zonas Territoriales
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Segmentación geoespacial por sectores de Popayán con preservación estricta de k-anonimato.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hidden sm:inline-block">
                    15 Celdas H3
                  </span>
                </div>

                <GuardiaModuloPlan
                  codigoModulo="MOD_FILTROS_TERRITORIALES"
                  nombreModulo="Filtros por Zonas Territoriales"
                  descripcionRequerida="El filtrado por zonas urbanas de Popayán y celdas geoespaciales H3 requiere el Plan Institucional Estándar o Enterprise."
                >
                  {/* Controles de Filtrado */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Selector de Zona */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Sector Territorial de Popayán
                        </label>
                        <select
                          value={zonaSeleccionada}
                          onChange={(e) => setZonaSeleccionada(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="">Todas las zonas ({resumen?.totalZonasMonitoreadas || 15})</option>
                          {resumen?.resumenZonas.map((z) => (
                            <option key={z.idCeldaH3} value={z.zonaManualId}>
                              {z.nombreZona} {z.cumpleUmbral ? '' : '(En reserva)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selector de Emoción */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Emoción Predominante
                        </label>
                        <select
                          value={emocionSeleccionada}
                          onChange={(e) => setEmocionSeleccionada(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="TODAS">Todas las emociones</option>
                          <option value="FELICIDAD">Felicidad</option>
                          <option value="NEUTRALIDAD">Neutralidad</option>
                          <option value="PREOCUPACION">Preocupación</option>
                          <option value="ENFADO">Enfado</option>
                          <option value="ANSIEDAD">Ansiedad</option>
                        </select>
                      </div>

                      {/* Selector de Periodo */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Ventana Temporal
                        </label>
                        <select
                          value={periodoSeleccionado}
                          onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="ULTIMAS_24_HORAS">Últimas 24 Horas</option>
                          <option value="ULTIMA_SEMANA">Última Semana</option>
                          <option value="ULTIMO_MES">Último Mes</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={aplicarFiltrosTerritoriales}
                        disabled={filtrando}
                        aria-busy={filtrando}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-wait"
                      >
                        {filtrando ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                            <span>Filtrando zonas...</span>
                          </>
                        ) : (
                          <>
                            <Filter className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Aplicar Filtro Territorial</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Grid de Zonas Territoriales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {zonasFiltradas.map((zona) => (
                      <div
                        key={zona.idCeldaH3}
                        className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-slate-400 font-medium">{zona.zonaManualId}</span>
                            {zona.cumpleUmbral ? (
                              <span
                                className="px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center gap-1.5"
                                style={{
                                  borderColor: zona.codigoHexColor,
                                  color: zona.codigoHexColor,
                                  backgroundColor: `${zona.codigoHexColor}15`,
                                }}
                              >
                                <IconoEmocionLucide
                                  icono={zona.icono}
                                  idEmocion={zona.emocionPredominante}
                                  color={zona.codigoHexColor}
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                />
                                <span>{zona.nombreEmocionPredominante}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                                <span>En Reserva</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mt-2">{zona.nombreZona}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{zona.descripcionZona}</p>

                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Participación:</span>
                              <span className="font-semibold text-slate-800">{zona.participantesAproximados}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Intensidad Media:</span>
                              <span className="font-semibold text-slate-800">
                                {zona.cumpleUmbral ? `${zona.intensidadPromedio} / 5.0` : 'En reserva'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tendencia:</span>
                              <span className="font-semibold text-slate-800">{zona.tendencia}</span>
                            </div>
                          </div>
                        </div>

                        {zona.cumpleUmbral && zona.distribucionPorcentual && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                              Distribución Hamilton-Hare:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(zona.distribucionPorcentual).map(([em, pct]) => (
                                <span
                                  key={em}
                                  className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono font-medium"
                                >
                                  {em}: {pct}%
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GuardiaModuloPlan>
              </div>
            )}

            {/* ================================================================ */}
            {/* SECCIÓN 3: EXPORTACIÓN DE REPORTES ANALÍTICOS OFICIALES */}
            {/* ================================================================ */}
            {seccionActiva === 'EXPORTACION_REPORTES' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Download className="w-5 h-5 text-emerald-600" />
                      Exportación de Reportes Analíticos Oficiales
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Generación y descarga de paquetes analíticos de Popayán para políticas públicas y toma de decisiones.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                    Plan Enterprise
                  </span>
                </div>

                <GuardiaModuloPlan
                  codigoModulo="MOD_EXPORTACION_REPORTES"
                  nombreModulo="Exportación y Analítica Avanzada"
                  descripcionRequerida="La exportación analítica en JSON/CSV está disponible exclusivamente en el Plan Enterprise."
                >
                  <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Dataset Completo de la Ciudad de Popayán</span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          Descargar Informe Analítico Territorial Oficial
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Exporta la base consolidada de las 15 zonas H3 de Popayán con metadatos oficiales del suscriptor,
                          métricas de intensidad promedio, tendencias y cumplimiento garantizado del protocolo de k-anonimato diferencial.
                        </p>
                      </div>

                      <button
                        onClick={ejecutarExportacion}
                        disabled={exportando}
                        aria-busy={exportando}
                        className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-wait whitespace-nowrap"
                      >
                        {exportando ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                            <span>Generando Dataset...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span>Descargar Dataset JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Especificaciones Técnicas del Reporte */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="font-bold text-slate-700 block">Formato Oficial:</span>
                        <p className="text-slate-500 font-mono text-[11px]">JSON estructurado UTF-8</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="font-bold text-slate-700 block">Privacidad y Auditoría:</span>
                        <p className="text-emerald-700 font-semibold text-[11px]">k &ge; 5 estricto auditado</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="font-bold text-slate-700 block">Alcance Geográfico:</span>
                        <p className="text-slate-500 text-[11px]">15 sectores urbanos Popayán</p>
                      </div>
                    </div>

                    {mensajeExportacion && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm">
                        <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                        <span className="font-medium">{mensajeExportacion}</span>
                      </div>
                    )}
                  </div>
                </GuardiaModuloPlan>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
