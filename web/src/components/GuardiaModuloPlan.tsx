import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface GuardiaModuloPlanProps {
  codigoModulo: string;
  nombreModulo?: string;
  descripcionRequerida?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente guardián que restringe secciones del sistema según los permisos del plan activo.
 * Si el módulo no está habilitado, renderiza una tarjeta de bloqueo con opción de Upgrade.
 */
export const GuardiaModuloPlan: React.FC<GuardiaModuloPlanProps> = ({
  codigoModulo,
  nombreModulo = 'Módulo Premium',
  descripcionRequerida = 'Esta funcionalidad analítica avanzada requiere una suscripción institucional activa con un plan superior.',
  children,
  fallback,
}) => {
  const { sesion } = useAuthInstitutional();

  // El plan FREE incluye MOD_DASHBOARD_BASICO
  // El plan STANDARD incluye MOD_DASHBOARD_BASICO y MOD_FILTROS_TERRITORIALES
  // El plan ENTERPRISE incluye todos los módulos
  const modulosHabilitados = sesion?.modulosHabilitados || [];
  const planActual = sesion?.codigoPlan || 'PLAN_FREE';

  // Verificar habilitación
  let tieneAcceso = modulosHabilitados.includes(codigoModulo);

  // Fallback si la sesión tiene permisos directamente mapeados por plan
  if (!tieneAcceso) {
    if (codigoModulo === 'MOD_DASHBOARD_BASICO') {
      tieneAcceso = true;
    } else if (codigoModulo === 'MOD_FILTROS_TERRITORIALES' && (planActual === 'PLAN_STANDARD' || planActual === 'PLAN_ENTERPRISE')) {
      tieneAcceso = true;
    } else if (codigoModulo === 'MOD_EXPORTACION_REPORTES' && planActual === 'PLAN_ENTERPRISE') {
      tieneAcceso = true;
    }
  }

  if (tieneAcceso) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm relative overflow-hidden my-4">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
        <Lock className="w-6 h-6" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span>Restricción de Plan ({planActual})</span>
      </div>

      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
        {nombreModulo} Restringido
      </h3>
      <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
        {descripcionRequerida}
      </p>

      <div className="pt-6">
        <Link
          to="/institutional/planes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Mejorar Plan en el Catálogo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
