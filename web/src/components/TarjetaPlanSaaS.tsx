import React, { useState } from 'react';
import { Loader2, Check, Lock } from 'lucide-react';
import { PlanSuscripcionCatalogoDto } from '../types/institutional';

interface TarjetaPlanSaaSProps {
  plan: PlanSuscripcionCatalogoDto;
  onSeleccionarPlan: (codigoPlan: string) => void;
}

export const TarjetaPlanSaaS: React.FC<TarjetaPlanSaaSProps> = ({ plan, onSeleccionarPlan }) => {
  const [seleccionando, setSeleccionando] = useState(false);

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
          ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]'
          : esStandard
          ? 'bg-white border-2 border-sky-500 shadow-lg shadow-sky-500/10 hover:border-sky-600 hover:shadow-xl'
          : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
      }`}
    >
      {/* Insignia Superior */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        {plan.esPlanActual ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-600 text-white shadow-sm inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tu Plan Actual</span>
          </span>
        ) : esStandard ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-sky-600 text-white shadow-sm">
            ★ Más Popular
          </span>
        ) : esEnterprise ? (
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-600 text-white shadow-sm">
            Empresarial
          </span>
        ) : (
          <span className="px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Freemium
          </span>
        )}
      </div>

      <div>
        {/* Cabecera del Plan */}
        <div className="text-center mt-2 mb-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{plan.nombre}</h3>
          <p className="text-xs text-slate-500 mt-2 min-h-[36px] leading-relaxed">{plan.descripcion}</p>
        </div>

        {/* Tarifa y Duración */}
        <div className="text-center pb-6 border-b border-slate-100">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {precioInfo.monto}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            {precioInfo.periodo}
          </span>
        </div>

        {/* Lista de Módulos */}
        <div className="py-6 space-y-3.5">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Módulos del Sistema Incluidos:
          </h4>
          <ul className="space-y-3">
            {plan.modulos.map((modulo) => (
              <li key={modulo.idModulo} className="flex items-start text-xs space-x-2.5">
                {modulo.habilitadoEnPlan ? (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                <div className="flex-1">
                  <span
                    className={`font-medium ${
                      modulo.habilitadoEnPlan ? 'text-slate-800' : 'text-slate-400 line-through'
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
            className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
          >
            Plan Actualmente Activo
          </button>
        ) : (
          <button
            id={`btn-adquirir-${plan.codigo}`}
            disabled={seleccionando}
            aria-busy={seleccionando}
            onClick={() => {
              setSeleccionando(true);
              onSeleccionarPlan(plan.codigo);
            }}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 ${
              esStandard
                ? 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow'
                : esEnterprise
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
            }`}
          >
            {seleccionando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Abriendo Checkout...</span>
              </>
            ) : (
              <span>Adquirir / Cambiar a este Plan</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
