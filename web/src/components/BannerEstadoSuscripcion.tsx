import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EstadoSuscripcionRespuesta } from '../types/institutional';

interface BannerEstadoSuscripcionProps {
  estado: EstadoSuscripcionRespuesta;
}

export const BannerEstadoSuscripcion: React.FC<BannerEstadoSuscripcionProps> = ({ estado }) => {
  const navigate = useNavigate();

  const esExpirada = estado.estadoSuscripcion === 'EXPIRADA' || !estado.vigente;

  return (
    <div className="space-y-4">
      {/* Alerta de Vencimiento o Expiración */}
      {estado.alertaVencimiento && (
        <div
          className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            esExpirada
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-start sm:items-center space-x-3.5">
            <span className={`p-2.5 rounded-xl text-xl font-bold flex-shrink-0 ${
              esExpirada ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {esExpirada ? '⛔' : '⚠️'}
            </span>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">
                {esExpirada
                  ? 'Suscripción Institucional Expirada'
                  : 'Suscripción Próxima a Vencer'}
              </h4>
              <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                {estado.mensajeEstado}
              </p>
            </div>
          </div>

          <button
            id="btn-renovar-plan"
            onClick={() => navigate('/institutional/planes')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow cursor-pointer whitespace-nowrap ${
              esExpirada
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950'
            }`}
          >
            {esExpirada ? 'Reactivar Licencia' : 'Renovar Plan'}
          </button>
        </div>
      )}

      {/* Resumen de Estado de la Licencia */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Licencia Institucional Almara
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                  estado.vigente
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                }`}
              >
                ● {estado.estadoSuscripcion}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {estado.nombrePlan}
            </h2>
            <p className="text-xs text-slate-400">
              Entidad: <span className="font-semibold text-slate-200">{estado.razonSocial}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center sm:text-left">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Vigencia Restante</span>
              <span className={`font-bold text-sm ${estado.diasRestantes <= 5 ? 'text-amber-400 font-extrabold' : 'text-slate-200'}`}>
                {estado.diasRestantes} días
              </span>
            </div>

            {estado.fechaExpiracion && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center sm:text-left">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Fecha Expiración</span>
                <span className="font-semibold text-slate-300 text-xs font-mono">
                  {new Date(estado.fechaExpiracion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            <button
              onClick={() => navigate('/institutional/planes')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Cambiar Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
