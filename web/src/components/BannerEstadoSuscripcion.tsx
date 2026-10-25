import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { EstadoSuscripcionRespuesta } from '../types/institutional';

interface BannerEstadoSuscripcionProps {
  estado: EstadoSuscripcionRespuesta;
}

export const BannerEstadoSuscripcion: React.FC<BannerEstadoSuscripcionProps> = ({ estado }) => {
  const navigate = useNavigate();
  const [navegandoAccion, setNavegandoAccion] = useState<'renovar' | 'cambiar' | null>(null);

  const esExpirada = estado.estadoSuscripcion === 'EXPIRADA' || !estado.vigente;

  const irACatalogo = (accion: 'renovar' | 'cambiar') => {
    setNavegandoAccion(accion);
    navigate('/institutional/planes');
  };

  return (
    <div className="space-y-4">
      {/* Alerta de Vencimiento o Expiración */}
      {estado.alertaVencimiento && (
        <div
          className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
            esExpirada
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start sm:items-center space-x-3.5">
            <span className={`p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center ${
              esExpirada ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {esExpirada ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </span>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {esExpirada
                  ? 'Suscripción Institucional Expirada'
                  : 'Suscripción Próxima a Vencer'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {estado.mensajeEstado}
              </p>
            </div>
          </div>

          <button
            id="btn-renovar-plan"
            disabled={navegandoAccion !== null}
            aria-busy={navegandoAccion === 'renovar'}
            onClick={() => irACatalogo('renovar')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5 ${
              esExpirada
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            {navegandoAccion === 'renovar' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span>Abriendo Planes...</span>
              </>
            ) : (
              <span>{esExpirada ? 'Reactivar Licencia' : 'Renovar Plan'}</span>
            )}
          </button>
        </div>
      )}

      {/* Resumen de Estado de la Licencia */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-600">
                Licencia Institucional Almara
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                  estado.vigente
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                }`}
              >
                ● {estado.estadoSuscripcion}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {estado.nombrePlan}
            </h2>
            <p className="text-xs text-slate-500">
              Entidad: <span className="font-semibold text-slate-800">{estado.razonSocial}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center sm:text-left">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-medium">Vigencia Restante</span>
              <span className={`font-bold text-sm ${estado.diasRestantes <= 5 ? 'text-amber-600 font-extrabold' : 'text-slate-800'}`}>
                {estado.diasRestantes} días
              </span>
            </div>

            {estado.fechaExpiracion && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center sm:text-left">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-medium">Fecha Expiración</span>
                <span className="font-semibold text-slate-700 text-xs font-mono">
                  {new Date(estado.fechaExpiracion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            <button
              disabled={navegandoAccion !== null}
              aria-busy={navegandoAccion === 'cambiar'}
              onClick={() => irACatalogo('cambiar')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-1.5"
            >
              {navegandoAccion === 'cambiar' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Cargando...</span>
                </>
              ) : (
                <span>Cambiar Plan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
