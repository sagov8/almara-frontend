import React from 'react';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import { useNavigate } from 'react-router-dom';

export const DashboardInstitucionalPage: React.FC = () => {
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

  if (!sesion) {
    return null;
  }

  const tieneFiltrosTerritoriales = sesion.modulosHabilitados?.includes('MOD_FILTROS_TERRITORIALES');
  const tieneExportacion = sesion.modulosHabilitados?.includes('MOD_EXPORTACION_REPORTES');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de renovación o alerta de plan */}
        {sesion.requiereRenovacion ? (
          <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border border-amber-500/50 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl shadow-amber-950/30">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 text-2xl font-bold flex-shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-base">Suscripción Pendiente de Renovación</h3>
                <p className="text-xs sm:text-sm text-amber-300/80 mt-1">
                  Su suscripción actual requiere activación o renovación para habilitar filtros avanzados por zonas de Popayán y exportación de reportes.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/institutional/planes')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg cursor-pointer whitespace-nowrap"
            >
              Renovar / Mejorar Plan
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-lg">
                📊
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Observatorio Territorial de Popayán Activo</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conexión segura al motor geoespacial H3 con resolución analítica urbana en tiempo real.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/institutional/mi-suscripcion')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Mi Suscripción
              </button>
              <button
                onClick={() => navigate('/institutional/planes')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow cursor-pointer"
              >
                Catálogo SaaS
              </button>
            </div>
          </div>
        )}

        {/* Tarjeta de Bienvenida a la Entidad */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 rounded-3xl p-7 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-0.5 text-[11px] font-bold tracking-widest uppercase rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  Panel Institucional
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  <span>Sistema Operativo</span>
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {sesion.razonSocial}
              </h1>
              <p className="text-xs text-slate-400">
                Cuenta Oficial: <span className="font-mono text-slate-300 font-medium">{sesion.correoInstitucional}</span> | Rol: <span className="text-slate-300">{sesion.rol}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl px-5 py-3 text-center sm:text-left shadow-inner">
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Plan Vigente</span>
                <span className="font-extrabold text-sky-300 text-sm mt-0.5 block">{sesion.nombrePlan || sesion.codigoPlan}</span>
              </div>
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl px-5 py-3 text-center sm:text-left shadow-inner">
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Estado Licencia</span>
                <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">{sesion.estadoSuscripcion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas e Indicadores de Inteligencia Emocional Urbana (Popayán) */}
        <div>
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
            Indicadores Clave de Inteligencia Emocional Urbana
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Clima Emocional Predominante</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-base">🌿</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-3">Tranquilidad / Calma</div>
              <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center space-x-1">
                <span>↑ 14% en Parque Caldas y Centro Histórico</span>
              </p>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Reportes Ciudadanos Registrados</span>
                <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-base">👥</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-3">1,482</div>
              <p className="text-[11px] text-slate-400 mt-1">Anonimizados con privacidad diferencial</p>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Zonas Urbanas Monitoreadas</span>
                <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-base">📍</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-3">15 Zonas H3</div>
              <p className="text-[11px] text-slate-400 mt-1">Comuna 1 a 9 del Municipio de Popayán</p>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Nivel de Cobertura SaaS</span>
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-base">🛡️</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-3">
                {sesion.modulosHabilitados?.length || 1} / 3 Módulos
              </div>
              <p className="text-[11px] text-sky-400 mt-1 cursor-pointer hover:underline" onClick={() => navigate('/institutional/planes')}>
                Ver opciones de ampliación →
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Módulos del Sistema */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Módulos Analíticos de la Plataforma
              </h2>
              <p className="text-xs text-slate-400">
                Estado de autorización según la matriz de permisos de su suscripción SaaS.
              </p>
            </div>
            <button
              onClick={() => navigate('/institutional/mi-suscripcion')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
            >
              Ver Detalle de Licencia →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Módulo 1: Dashboard Básico */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 relative flex flex-col justify-between hover:border-sky-500/40 transition-all shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                    📈
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    ✓ Habilitado
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition">
                  Dashboard Analítico Básico
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Visualización consolidada de emociones colectivas registradas en la ciudad con promedios temporales y tendencias generales.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-500">MOD_DASHBOARD_BASICO</span>
              </div>
            </div>

            {/* Módulo 2: Filtros Territoriales */}
            <div className={`rounded-3xl p-6 relative flex flex-col justify-between transition-all shadow-xl group ${
              tieneFiltrosTerritoriales
                ? 'bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/40'
                : 'bg-slate-900/30 border border-slate-800/50 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    tieneFiltrosTerritoriales
                      ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    🗺️
                  </div>
                  {tieneFiltrosTerritoriales ? (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      ✓ Habilitado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      🔒 Plan Estándar / Pro
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                  Filtros por Zonas Territoriales
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Segmentación geoespacial multicelda (Uber H3 resolución 8) por comunas, barrios y cuadrantes críticos de Popayán.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">MOD_FILTROS_TERRITORIALES</span>
                {!tieneFiltrosTerritoriales && (
                  <button
                    onClick={() => navigate('/institutional/planes')}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Desbloquear →
                  </button>
                )}
              </div>
            </div>

            {/* Módulo 3: Exportación y Reportes */}
            <div className={`rounded-3xl p-6 relative flex flex-col justify-between transition-all shadow-xl group ${
              tieneExportacion
                ? 'bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/40'
                : 'bg-slate-900/30 border border-slate-800/50 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    tieneExportacion
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    📑
                  </div>
                  {tieneExportacion ? (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      ✓ Habilitado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      🔒 Plan Enterprise
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  Exportación y Analítica Avanzada
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Descarga masiva de datasets anonimizados en CSV/PDF, series temporales históricas y reportes ejecutivos para políticas públicas.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">MOD_EXPORTACION_REPORTES</span>
                {!tieneExportacion && (
                  <button
                    onClick={() => navigate('/institutional/planes')}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Desbloquear →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
