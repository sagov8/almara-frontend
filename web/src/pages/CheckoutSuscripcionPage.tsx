import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import {
  consultarCatalogoPlanes,
  adquirirPlanYCrearOrden,
  procesarPagoSuscripcion,
  reintentarPagoSuscripcion,
} from '../services/apiInstitutional';
import {
  PlanSuscripcionCatalogoDto,
  OrdenSuscripcionRespuesta,
  PagoSuscripcionRespuesta,
} from '../types/institutional';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import { ModalComprobantePago } from '../components/ModalComprobantePago';
import {
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Check,
  FileText,
  Layers,
  Zap,
  Receipt,
} from 'lucide-react';

export const CheckoutSuscripcionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sesion, actualizarTokenAcceso } = useAuthInstitutional();

  const codigoPlanParam = searchParams.get('plan') || 'PLAN_STANDARD';

  const [plan, setPlan] = useState<PlanSuscripcionCatalogoDto | null>(null);
  const [cargandoPlan, setCargandoPlan] = useState<boolean>(true);
  const [generandoOrden, setGenerandoOrden] = useState<boolean>(false);
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de checkout y pago
  const [orden, setOrden] = useState<OrdenSuscripcionRespuesta | null>(null);
  const [pagoResultado, setPagoResultado] = useState<PagoSuscripcionRespuesta | null>(null);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState<boolean>(false);
  const [fasePago, setFasePago] = useState<string>('Procesando cobro en Stripe...');
  const [navegandoPostPago, setNavegandoPostPago] = useState<'dashboard' | 'suscripcion' | null>(null);

  // Modo de prueba para simular pago aprobado o rechazado en Stripe Test Mode
  const [modoDemo, setModoDemo] = useState<'APROBAR' | 'RECHAZAR'>('APROBAR');

  // Cargar detalles del plan seleccionado
  useEffect(() => {
    let cancelado = false;

    const cargarDetallePlan = async () => {
      setCargandoPlan(true);
      setError(null);
      try {
        const respuesta = await consultarCatalogoPlanes(sesion?.tokenAcceso);
        if (!cancelado) {
          const planEncontrado = respuesta.planes.find(
            (p) => p.codigo.toUpperCase() === codigoPlanParam.toUpperCase()
          );
          if (planEncontrado) {
            setPlan(planEncontrado);
          } else {
            setError(`No se encontró el plan solicitado (${codigoPlanParam}).`);
          }
        }
      } catch (err: unknown) {
        if (!cancelado) {
          const apiErr = err as { mensaje?: string };
          setError(apiErr?.mensaje || 'Error al recuperar detalles del plan seleccionado.');
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
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(
        apiErr?.mensaje ||
          'Ocurrió un error al generar la orden de pedido. Por favor intente nuevamente.'
      );
    } finally {
      setGenerandoOrden(false);
    }
  };

  // Procesar Pago mediante Pasarela Stripe (HU-23)
  const handleProcesarPago = async () => {
    if (!orden || !sesion?.tokenAcceso) return;

    setProcesandoPago(true);
    setError(null);
    setFasePago('Conectando de forma segura con Stripe...');

    const t1 = setTimeout(() => {
      setFasePago('Validando cobro y despachando notificación SMTP...');
    }, 1000);

    const t2 = setTimeout(() => {
      setFasePago('Confirmando transacción y generando comprobante oficial...');
    }, 2200);

    try {
      const tokenAEnviar = modoDemo === 'APROBAR' ? 'pm_card_visa' : 'pm_card_visa_chargeDeclined';

      const respuesta = await procesarPagoSuscripcion(
        {
          idOrden: orden.idOrden,
          metodoPago: 'TARJETA_CREDITO_STRIPE',
          tokenMedioPago: tokenAEnviar,
        },
        sesion.tokenAcceso
      );

      setPagoResultado(respuesta);

      if (respuesta.pagoAprobado) {
        // Abrir modal de comprobante oficial de pago automáticamente
        setMostrarModalComprobante(true);

        // Actualizar sesión con el nuevo JWT emitido para acceso inmediato
        if (respuesta.tokenAccesoActualizado) {
          actualizarTokenAcceso(
            respuesta.tokenAccesoActualizado,
            respuesta.codigoPlanActivado || plan?.codigo
          );
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(apiErr?.mensaje || 'Error al comunicarse con el servicio de pagos.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setProcesandoPago(false);
    }
  };

  // Reintentar Pago Fallido (Caso de uso extendido HU-23)
  const handleReintentarPago = async () => {
    if (!orden || !sesion?.tokenAcceso) return;

    setProcesandoPago(true);
    setError(null);
    setFasePago('Reintentando cobro con tarjeta Visa...');

    const t1 = setTimeout(() => {
      setFasePago('Confirmando pago con Stripe y enviando notificación...');
    }, 1100);

    try {
      // Al reintentar, por defecto cambiamos a aprobación exitosa con Visa
      const tokenAEnviar = 'pm_card_visa';
      setModoDemo('APROBAR');

      const respuesta = await reintentarPagoSuscripcion(
        {
          idOrden: orden.idOrden,
          metodoPago: 'TARJETA_CREDITO_STRIPE',
          tokenMedioPago: tokenAEnviar,
        },
        sesion.tokenAcceso
      );

      setPagoResultado(respuesta);

      if (respuesta.pagoAprobado) {
        setMostrarModalComprobante(true);
        if (respuesta.tokenAccesoActualizado) {
          actualizarTokenAcceso(
            respuesta.tokenAccesoActualizado,
            respuesta.codigoPlanActivado || plan?.codigo
          );
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setError(apiErr?.mensaje || 'Error al reintentar el pago de la orden.');
    } finally {
      clearTimeout(t1);
      setProcesandoPago(false);
    }
  };

  const formatearMonedaCop = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb de Navegación */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link
            to="/institutional/planes"
            className="hover:text-sky-600 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Catálogo de Planes
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Checkout y Pago Seguro (HU-22 & HU-23)</span>
        </div>

        {/* Encabezado Principal */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Módulo de Checkout y Pagos SaaS (HU-22 / HU-23)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout de Suscripción y Procesamiento de Pago
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Revisa tu orden de pedido y procesa el cobro a través de Stripe Sandbox / Test Mode.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Atención al procesar transacción:</p>
              <p className="text-rose-700 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {cargandoPlan ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
            <p className="text-sm font-medium">Cargando especificaciones del plan SaaS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Especificaciones del Plan */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-sky-600 font-bold">
                      Plan Seleccionado
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {plan?.nombre || codigoPlanParam}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {plan?.duracionDias} días de vigencia
                  </span>
                </div>

                <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                  {plan?.descripcion}
                </p>

                {/* Módulos Habilitados */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Módulos y Capacidades Incluidas
                  </h3>
                  <div className="space-y-2.5">
                    {plan?.modulos?.map((mod) => (
                      <div
                        key={mod.idModulo}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                          mod.habilitadoEnPlan
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-slate-50/50 border-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            mod.habilitadoEnPlan ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{mod.nombreModulo}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{mod.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garantías y Seguridad */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    Conformidad RNF-13 de auditoría institucional y cifrado SSL/TLS de 256 bits con Stripe.
                  </span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Orden y Pasarela de Pago */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Resumen Financiero de la Orden
                </h3>

                {/* Desglose de Precios */}
                <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Suscripción ({plan?.nombre}):</span>
                    <span className="font-bold text-slate-900">
                      {formatearMonedaCop(plan?.precioFinal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Periodo de facturación:</span>
                    <span>{plan?.duracionDias} días</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Impuestos (IVA SaaS):</span>
                    <span className="text-emerald-600 font-medium">Incluidos (0.00 COP)</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline py-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                      Total a Pagar
                    </span>
                    <p className="text-[10px] text-slate-400">Moneda legal colombiana (COP)</p>
                  </div>
                  <span className="text-2xl font-black text-sky-600">
                    {formatearMonedaCop(plan?.precioFinal || 0)}
                  </span>
                </div>

                {/* PASO 1: Generar Orden de Suscripción */}
                {!orden && (
                  <div className="pt-6">
                    <button
                      id="btn-confirmar-checkout"
                      onClick={handleConfirmarOrden}
                      disabled={generandoOrden || !plan}
                      aria-busy={generandoOrden}
                      className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {generandoOrden ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                          <span>Generando Orden de Pedido...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generar Orden de Suscripción</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* PASO 2: Procesar Pago de la Orden Generada (HU-23) */}
                {orden && !pagoResultado?.pagoAprobado && (
                  <div className="pt-6 space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Orden Oficial:</span>
                        <strong className="text-slate-900 font-mono">{orden.numeroOrden}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Estado Orden:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          {pagoResultado?.estadoOrden || orden.estadoOrden}
                        </span>
                      </div>
                    </div>

                    {/* Selector de Simulación de Stripe Test Mode */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-sky-600" />
                        Medio de Pago (Stripe Test Mode)
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={procesandoPago}
                          onClick={() => setModoDemo('APROBAR')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            modoDemo === 'APROBAR'
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Visa (Aprobar)
                        </button>
                        <button
                          type="button"
                          disabled={procesandoPago}
                          onClick={() => setModoDemo('RECHAZAR')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            modoDemo === 'RECHAZAR'
                              ? 'bg-rose-50 border-rose-400 text-rose-800'
                              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Simular Rechazo (0002)
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {modoDemo === 'APROBAR'
                          ? '✅ Simula pago aprobado exitoso mediante PaymentIntent de Stripe en tiempo real.'
                          : '⚠️ Simula fondos insuficientes o tarjeta declinada para probar reintento (HU-23).'}
                      </p>
                    </div>

                    {/* Alerta de Pago Rechazado */}
                    {pagoResultado && !pagoResultado.pagoAprobado && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          Transacción Rechazada
                        </div>
                        <p className="text-rose-700">{pagoResultado.motivoRechazo}</p>
                        <button
                          id="btn-reintentar-pago"
                          onClick={handleReintentarPago}
                          disabled={procesandoPago}
                          aria-busy={procesandoPago}
                          className="w-full mt-2 py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          {procesandoPago ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                              <span className="truncate">{fasePago}</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 flex-shrink-0" />
                              <span>Reintentar Pago con Visa (Extend HU-23)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Botón Pagar Inicial */}
                    {(!pagoResultado || pagoResultado.pagoAprobado) && (
                      <button
                        id="btn-procesar-pago"
                        onClick={handleProcesarPago}
                        disabled={procesandoPago}
                        aria-busy={procesandoPago}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {procesandoPago ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                            <span className="truncate">{fasePago}</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Confirmar y Pagar {formatearMonedaCop(plan?.precioFinal || 0)}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* PASO 3: Pago Exitoso Confirmado */}
                {pagoResultado?.pagoAprobado && (
                  <div className="pt-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5 font-black text-sm text-emerald-900">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <Check className="w-4 h-4" />
                        </div>
                        ¡Pago Aprobado y Suscripción Activada!
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] text-emerald-800">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-700">Orden Oficial:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {pagoResultado.numeroOrden}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-700">Referencia Stripe:</span>
                          <strong className="text-slate-900 font-mono">
                            {pagoResultado.referenciaExterna}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-700">Monto Acreditado:</span>
                          <strong className="text-emerald-950 font-bold">
                            {formatearMonedaCop(pagoResultado.montoPagado)}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/80">
                        <button
                          type="button"
                          id="btn-ver-comprobante"
                          onClick={() => setMostrarModalComprobante(true)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                          Ver Comprobante Oficial de Pago
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        disabled={navegandoPostPago !== null}
                        aria-busy={navegandoPostPago === 'dashboard'}
                        onClick={() => {
                          setNavegandoPostPago('dashboard');
                          navigate('/institutional/dashboard');
                        }}
                        className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                      >
                        {navegandoPostPago === 'dashboard' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                            <span>Abriendo...</span>
                          </>
                        ) : (
                          <>
                            <span>Ir al Dashboard</span>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                          </>
                        )}
                      </button>
                      <button
                        disabled={navegandoPostPago !== null}
                        aria-busy={navegandoPostPago === 'suscripcion'}
                        onClick={() => {
                          setNavegandoPostPago('suscripcion');
                          navigate('/institutional/mi-suscripcion');
                        }}
                        className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-wait"
                      >
                        {navegandoPostPago === 'suscripcion' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                            <span>Abriendo...</span>
                          </>
                        ) : (
                          <span>Mi Suscripción</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Información Institucional */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 space-y-1 shadow-sm">
                <p>
                  <strong className="text-slate-800">Entidad:</strong>{' '}
                  {sesion?.razonSocial || 'Entidad Institucional'}
                </p>
                <p>
                  <strong className="text-slate-800">Correo:</strong>{' '}
                  {sesion?.correoInstitucional}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprobante Oficial de Pago */}
        {pagoResultado && (
          <ModalComprobantePago
            abierto={mostrarModalComprobante}
            alCerrar={() => setMostrarModalComprobante(false)}
            pago={pagoResultado}
            plan={plan}
            orden={orden}
            razonSocial={sesion?.razonSocial}
            correo={sesion?.correoInstitucional}
            onIrAlDashboard={() => navigate('/institutional/dashboard')}
            onIrAMiSuscripcion={() => navigate('/institutional/mi-suscripcion')}
          />
        )}
      </main>
    </div>
  );
};
