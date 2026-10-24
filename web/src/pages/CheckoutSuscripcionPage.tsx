import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import {
  consultarCatalogoPlanes,
  adquirirPlanYCrearOrden,
} from '../services/apiInstitutional';
import {
  PlanSuscripcionCatalogoDto,
  OrdenSuscripcionRespuesta,
} from '../types/institutional';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const CheckoutSuscripcionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const codigoPlanParam = searchParams.get('plan') || 'PLAN_STANDARD';
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanSuscripcionCatalogoDto | null>(null);
  const [orden, setOrden] = useState<OrdenSuscripcionRespuesta | null>(null);
  const [cargandoPlan, setCargandoPlan] = useState<boolean>(true);
  const [generandoOrden, setGenerandoOrden] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar información del catálogo para validar y pintar detalles del plan seleccionado
  useEffect(() => {
    let cancelado = false;
    const cargarDetallePlan = async () => {
      setCargandoPlan(true);
      setError(null);
      try {
        const respuesta = await consultarCatalogoPlanes(sesion?.tokenAcceso);
        const planEncontrado = respuesta.planes.find(
          (p) => p.codigo.toUpperCase() === codigoPlanParam.toUpperCase()
        );
        if (!cancelado) {
          if (planEncontrado) {
            setPlan(planEncontrado);
          } else {
            setError(`El plan ${codigoPlanParam} no fue encontrado en el catálogo.`);
          }
        }
      } catch (err: any) {
        if (!cancelado) {
          setError(err?.mensaje || 'Error al recuperar detalles del plan seleccionado.');
        }
      } finally {
        if (!cancelado) {
          setCargandoPlan(false);
        }
      }
    };

    cargarDetallePlan();
    return () => {
      cancelado = true;
    };
  }, [codigoPlanParam, sesion]);

  // Manejar creación o reutilización idempotente de la orden de pedido
  const handleConfirmarOrden = async () => {
    if (!sesion?.tokenAcceso) {
      navigate('/institutional/login');
      return;
    }

    setGenerandoOrden(true);
    setError(null);

    try {
      const respuesta = await adquirirPlanYCrearOrden(
        {
          codigoPlan: codigoPlanParam,
          metodoPagoPreferido: 'STRIPE_TEST',
        },
        sesion.tokenAcceso
      );
      setOrden(respuesta);
    } catch (err: any) {
      setError(
        err?.mensaje ||
          'Ocurrió un error al generar la orden de pedido. Por favor intente nuevamente.'
      );
    } finally {
      setGenerandoOrden(false);
    }
  };

  const formatearMonedaCop = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb de Navegación */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link
            to="/institutional/planes"
            className="hover:text-sky-400 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Catálogo de Planes
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Checkout y Generación de Orden</span>
        </div>

        {/* Encabezado Principal */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Módulo de Checkout Seguro SaaS (HU-22)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Confirmación de Suscripción Institucional
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Revisa el detalle de tu selección antes de generar la orden de pedido oficial calculada por el backend.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Atención al procesar checkout:</p>
              <p className="text-rose-200/90 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {cargandoPlan ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
            <p className="text-sm">Cargando especificaciones del plan SaaS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Especificaciones y Módulos del Plan Seleccionado */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                      Plan Seleccionado
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {plan?.nombre || codigoPlanParam}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    {plan?.duracionDias} días de vigencia
                  </span>
                </div>

                <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                  {plan?.descripcion}
                </p>

                {/* Módulos Habilitados en este Plan */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Módulos y Capacidades Incluidas
                  </h3>
                  <div className="space-y-2.5">
                    {plan?.modulos?.map((mod) => (
                      <div
                        key={mod.idModulo}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                          mod.habilitadoEnPlan
                            ? 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/40 text-slate-500 line-through'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            mod.habilitadoEnPlan ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{mod.nombreModulo}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{mod.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garantías y Seguridad */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Conformidad RNF-13 de auditoría institucional y cálculo de precios auditado 100% en backend.
                  </span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Carrito y Resumen Financiero de la Orden */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Resumen de la Orden de Pedido
                </h3>

                {/* Desglose de Precios */}
                <div className="space-y-3 text-xs border-b border-slate-800 pb-4">
                  <div className="flex justify-between text-slate-300">
                    <span>Suscripción Base ({plan?.nombre}):</span>
                    <span className="font-semibold text-white">
                      {formatearMonedaCop(plan?.precioFinal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Periodo de facturación:</span>
                    <span>{plan?.duracionDias} días</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Impuestos / Retenciones (IVA SaaS):</span>
                    <span className="text-emerald-400 font-medium">Incluidos (0.00 COP)</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline py-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                      Total a Pagar
                    </span>
                    <p className="text-[10px] text-slate-500">Moneda legal colombiana (COP)</p>
                  </div>
                  <span className="text-2xl font-extrabold text-sky-400">
                    {formatearMonedaCop(plan?.precioFinal || 0)}
                  </span>
                </div>

                {/* Estado de Orden Creada o Botón para Generar Orden */}
                <div className="pt-6">
                  {orden ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                        <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Orden de Pedido Generada
                        </div>
                        <p className="text-emerald-300/80">
                          Número Oficial: <strong className="text-white">{orden.numeroOrden}</strong>
                        </p>
                        <p className="text-emerald-300/80 mt-1">
                          Estado: <span className="px-2 py-0.5 rounded bg-emerald-900/60 font-semibold">{orden.estadoOrden}</span>
                        </p>
                        <p className="text-emerald-300/80 mt-1">
                          Líneas de Detalle: {orden.lineasDetalle.length} ítem ({formatearMonedaCop(orden.montoTotal)})
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/60 text-xs text-sky-200 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sky-300">
                          <CreditCard className="w-4 h-4 text-sky-400" />
                          Siguiente Paso: Procesar Pago (HU-23)
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          La orden de pedido se encuentra registrada en backend. En el siguiente paso podrás realizar la simulación de pago seguro mediante Stripe en modo Sandbox / Test.
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/institutional/mi-suscripcion`)}
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        Ver Estado en Mi Suscripción
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-confirmar-checkout"
                      onClick={handleConfirmarOrden}
                      disabled={generandoOrden || !plan}
                      className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {generandoOrden ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando Orden de Pedido...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generar Orden de Suscripción (Checkout)
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Información Institucional */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/70 text-xs text-slate-400 space-y-1">
                <p>
                  <strong className="text-slate-300">Cliente Facturación:</strong>{' '}
                  {sesion?.razonSocial || 'Entidad Institucional'}
                </p>
                <p>
                  <strong className="text-slate-300">Correo Notificación:</strong>{' '}
                  {sesion?.correoInstitucional}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
