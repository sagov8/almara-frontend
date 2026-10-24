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
} from 'lucide-react';

export const DashboardInstitucionalPage: React.FC = () => {
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

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
        {/* Banner de renovación o alerta de plan */}
        {sesion.requiereRenovacion ? (
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
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Observatorio Territorial de Popayán Activo (RF-34)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conexión segura al motor analítico H3 con privacidad ciudadana diferencial ({`k >= 5`}).
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                disabled={navegandoRuta !== null}
                aria-busy={navegandoRuta === 'suscripcion'}
                onClick={() => {
                  setNavegandoRuta('suscripcion');
                  navigate('/institutional/mi-suscripcion');
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
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
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
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
        )}

        {/* Tarjeta de Cabecera Corporativa */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-0.5 text-[11px] font-bold tracking-widest uppercase rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                  Panel Analítico Institucional
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>K-Anonimato Activo</span>
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {resumen?.razonSocial || sesion.razonSocial}
              </h1>
              <p className="text-xs text-slate-500">
                Cuenta Oficial: <span className="font-mono text-slate-800 font-medium">{sesion.correoInstitucional}</span> | Plan Activo: <span className="font-bold text-sky-700">{resumen?.codigoPlanActivo || sesion.codigoPlan}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarResumen}
                disabled={cargando}
                aria-busy={cargando}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-300 transition flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
                {cargando ? 'Actualizando datos...' : 'Actualizar Datos'}
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

        {/* Indicadores Clave de Inteligencia Emocional Urbana (Popayán) */}
        <div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-600 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            Indicadores Clave de Inteligencia Emocional Urbana (Popayán)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Clima Predominante */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Clima Predominante Ciudad</span>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-base font-bold">🌱</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-3">
                {resumen?.emocionPredominanteCiudad || 'Cargando...'}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Intensidad promedio: {resumen?.intensidadPromedioCiudad || 0} / 5.0
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
              <p className="text-[11px] text-indigo-700 font-medium mt-1">Protección en comunidad validada</p>
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
              <p className="text-[11px] text-amber-700 font-medium mt-1">{`< 5 vecinos (datos protegidos)`}</p>
            </div>
          </div>
        </div>

        {/* Desglose Porcentual Global de Emociones en Popayán */}
        {resumen?.distribucionGlobalCiudad && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Distribución Emocional de la Ciudad de Popayán (Hamilton-Hare 100%)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {resumen.distribucionGlobalCiudad.map((ind) => (
                <div
                  key={ind.idEmocion}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{ind.icono}</span>
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

        {/* Panel de Filtrado por Zonas Territoriales (<<extend>> MOD_FILTROS_TERRITORIALES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Filtrado y Análisis por Zonas Territoriales
              </h2>
              <p className="text-xs text-slate-500">
                Segmentación geoespacial por sectores de Popayán con preservación estricta de k-anonimato.
              </p>
            </div>
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
                    <option value="FELICIDAD">😊 Felicidad</option>
                    <option value="NEUTRALIDAD">😐 Neutralidad</option>
                    <option value="PREOCUPACION">😟 Preocupación</option>
                    <option value="ENFADO">😡 Enfado</option>
                    <option value="ANSIEDAD">😰 Ansiedad</option>
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
                          className="px-2.5 py-0.5 text-[11px] font-bold rounded-full border"
                          style={{
                            borderColor: zona.codigoHexColor,
                            color: zona.codigoHexColor,
                            backgroundColor: `${zona.codigoHexColor}15`,
                          }}
                        >
                          {zona.icono} {zona.nombreEmocionPredominante}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          🔒 En Reserva
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

        {/* Sección de Exportación y Descarga de Reportes (MOD_EXPORTACION_REPORTES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                Exportación de Reportes Analíticos Oficiales
              </h2>
              <p className="text-xs text-slate-500">
                Generación y descarga de paquetes analíticos de Popayán para políticas públicas y toma de decisiones.
              </p>
            </div>
          </div>

          <GuardiaModuloPlan
            codigoModulo="MOD_EXPORTACION_REPORTES"
            nombreModulo="Exportación y Analítica Avanzada"
            descripcionRequerida="La exportación analítica en JSON/CSV está disponible exclusivamente en el Plan Enterprise."
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Descargar Informe Analítico Territorial Completo
                </h4>
                <p className="text-xs text-slate-500">
                  Incluye las 15 zonas de Popayán, metadatos oficiales del suscriptor, métricas agregadas y cumplimiento de k-anonimato.
                </p>
              </div>

              <button
                onClick={ejecutarExportacion}
                disabled={exportando}
                aria-busy={exportando}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-wait whitespace-nowrap"
              >
                {exportando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>Generando reporte...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span>Descargar Dataset JSON</span>
                  </>
                )}
              </button>
            </div>

            {mensajeExportacion && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
                <FileCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span className="font-medium">{mensajeExportacion}</span>
              </div>
            )}
          </GuardiaModuloPlan>
        </div>
      </main>
    </div>
  );
};
