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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de renovación si aplica */}
        {sesion.requiereRenovacion && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-xl font-bold">
                ⚠️
              </span>
              <div>
                <h3 className="font-semibold text-amber-200">Suscripción Expirada o Pendiente de Activación</h3>
                <p className="text-sm text-amber-300/80">
                  Su suscripción actual requiere renovación para habilitar las funcionalidades completas de exportación, reportes y mapas en tiempo real.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/institutional/planes')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-xs transition shadow cursor-pointer whitespace-nowrap"
            >
              Ver Planes SaaS
            </button>
          </div>
        )}

        {/* Header Entidad */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Panel Institucional Almara
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                {sesion.razonSocial}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Identificador: <span className="font-mono text-slate-300">{sesion.idInstitucion}</span> | Rol: <span className="text-slate-300">{sesion.rol}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Plan Activo</span>
                <span className="font-semibold text-sky-300 text-sm">{sesion.nombrePlan || sesion.codigoPlan}</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Estado Suscripción</span>
                <span className="font-semibold text-emerald-400 text-sm">{sesion.estadoSuscripcion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos Habilitados */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Módulos Habilitados por su Suscripción</h2>
          {sesion.modulosHabilitados && sesion.modulosHabilitados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sesion.modulosHabilitados.map((mod) => (
                <div
                  key={mod}
                  className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 hover:border-sky-500/50 transition duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition">
                    MOD
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-sky-300 transition">
                    {mod}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Acceso activo y autorizado para consultas analíticas de la entidad.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <p className="text-sm">
                No tiene módulos activos en este momento. Adquiera o renueve un plan SaaS para desbloquear módulos.
              </p>
              <button
                onClick={() => navigate('/institutional/planes')}
                className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Explorar Catálogo de Planes
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
