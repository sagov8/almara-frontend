import React from 'react';
import { PlanSuscripcionCatalogoDto } from '../types/institutional';

interface TarjetaPlanSaaSProps {
  plan: PlanSuscripcionCatalogoDto;
  onSeleccionarPlan: (codigoPlan: string) => void;
}

export const TarjetaPlanSaaS: React.FC<TarjetaPlanSaaSProps> = ({ plan, onSeleccionarPlan }) => {
  const formatearPrecio = (precio: number, esGratuito: boolean, duracionDias: number) => {
    if (esGratuito || precio === 0) {
      return {
        monto: '$0',
        periodo: 'Acceso Básico Gratuito',
      };
    }
    return {
      monto: `$${Number(precio).toLocaleString('es-CO')}`,
      periodo: `COP / ${duracionDias} días`,
    };
  };

  const precioInfo = formatearPrecio(plan.precioFinal, plan.esGratuito, plan.duracionDias);

  const esStandard = plan.codigo === 'PLAN_STANDARD';
  const esEnterprise = plan.codigo === 'PLAN_ENTERPRISE';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ${
        plan.esPlanActual
          ? 'bg-slate-900/90 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/10 scale-[1.02]'
          : esStandard
          ? 'bg-slate-900/90 border-2 border-sky-500/80 shadow-2xl shadow-sky-500/15 hover:border-sky-400'
          : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-xl'
      }`}
    >
      {/* Insignia Superior */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        {plan.esPlanActual ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500 text-slate-950 shadow-md">
            ✓ Tu Plan Actual
          </span>
        ) : esStandard ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-sky-500 text-slate-950 shadow-md">
            ★ Más Popular
          </span>
        ) : esEnterprise ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-500 text-white shadow-md">
            Empresarial
          </span>
        ) : (
          <span className="px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Freemium
          </span>
        )}
      </div>

      <div>
        {/* Cabecera del Plan */}
        <div className="text-center mt-2 mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">{plan.nombre}</h3>
          <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.descripcion}</p>
        </div>

        {/* Tarifa y Duración */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {precioInfo.monto}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-medium">
            {precioInfo.periodo}
          </span>
        </div>

        {/* Lista de Módulos */}
        <div className="py-6 space-y-3.5">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Módulos del Sistema Incluidos:
          </h4>
          <ul className="space-y-3">
            {plan.modulos.map((modulo) => (
              <li key={modulo.idModulo} className="flex items-start text-xs space-x-2.5">
                {modulo.habilitadoEnPlan ? (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px]">
                    🔒
                  </span>
                )}
                <div className="flex-1">
                  <span
                    className={`font-medium ${
                      modulo.habilitadoEnPlan ? 'text-slate-200' : 'text-slate-500 line-through'
                    }`}
                  >
                    {modulo.nombreModulo}
                  </span>
                  {modulo.descripcion && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {modulo.descripcion}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botón de Selección o Estado */}
      <div className="pt-4 mt-auto">
        {plan.esPlanActual ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 cursor-default"
          >
            Plan Actualmente Activo
          </button>
        ) : (
          <button
            id={`btn-adquirir-${plan.codigo}`}
            onClick={() => onSeleccionarPlan(plan.codigo)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer ${
              esStandard
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 hover:shadow-sky-500/25'
                : esEnterprise
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            Adquirir / Cambiar a este Plan
          </button>
        )}
      </div>
    </div>
  );
};
