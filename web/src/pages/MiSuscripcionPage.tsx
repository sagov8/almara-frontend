import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { consultarMiEstadoSuscripcion } from '../services/apiInstitutional';
import { EstadoSuscripcionRespuesta } from '../types/institutional';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import { BannerEstadoSuscripcion } from '../components/BannerEstadoSuscripcion';

export const MiSuscripcionPage: React.FC = () => {
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

  const [estado, setEstado] = useState<EstadoSuscripcionRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [navegandoRuta, setNavegandoRuta] = useState<'panel' | 'planes' | null>(null);

  const cargarEstado = useCallback(async () => {
    if (!sesion?.tokenAcceso) {
      return;
    }
    setCargando(true);
    setErrorMensaje(null);
    try {
      const respuesta = await consultarMiEstadoSuscripcion(sesion.tokenAcceso);
      setEstado(respuesta);
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setErrorMensaje(apiErr?.mensaje || 'No fue posible consultar el estado de la suscripción.');
    } finally {
      setCargando(false);
    }
  }, [sesion?.tokenAcceso]);

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera y Navegación rápida */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión de Mi Suscripción SaaS
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consulte la vigencia, módulos autorizados e historial de órdenes de su institución.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={cargarEstado}
              disabled={cargando}
              aria-busy={cargando}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
              <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
            <button
              disabled={navegandoRuta !== null}
              aria-busy={navegandoRuta === 'panel'}
              onClick={() => {
                setNavegandoRuta('panel');
                navigate('/institutional/dashboard');
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
            >
              {navegandoRuta === 'panel' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Abriendo Panel...</span>
                </>
              ) : (
                <span>← Volver al Panel</span>
              )}
            </button>
            <button
              disabled={navegandoRuta !== null}
              aria-busy={navegandoRuta === 'planes'}
              onClick={() => {
                setNavegandoRuta('planes');
                navigate('/institutional/planes');
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-xs text-white font-semibold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5"
            >
              {navegandoRuta === 'planes' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Abriendo Planes...</span>
                </>
              ) : (
                <span>Ver Catálogo de Planes</span>
              )}
            </button>
          </div>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Verificando estado de suscripción y licencias...</p>
          </div>
        )}

        {/* Estado de Error */}
        {errorMensaje && !cargando && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-rose-700 font-medium">{errorMensaje}</p>
            <button
              onClick={cargarEstado}
              disabled={cargando}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              {cargando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Contenido Principal */}
        {!cargando && !errorMensaje && estado && (
          <div className="space-y-8">
            {/* Banner de Estado */}
            <BannerEstadoSuscripcion estado={estado} />

            {/* Módulos Habilitados vs Restringidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Módulos Habilitados */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Módulos Habilitados ({estado.modulosHabilitados.length})</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Acceso Total
                  </span>
                </div>
                {estado.modulosHabilitados.length > 0 ? (
                  <ul className="space-y-2.5">
                    {estado.modulosHabilitados.map((mod) => (
                      <li key={mod} className="flex items-center text-xs space-x-2 text-slate-800 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-emerald-600 font-bold text-sm">✓</span>
                        <span className="font-semibold">{mod}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay módulos habilitados con el estado actual.</p>
                )}
              </div>

              {/* Módulos Restringidos */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                    <span>Módulos Restringidos ({estado.modulosRestringidos.length})</span>
                  </h3>
                  <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Requiere Mejora
                  </span>
                </div>
                {estado.modulosRestringidos.length > 0 ? (
                  <ul className="space-y-2.5">
                    {estado.modulosRestringidos.map((mod) => (
                      <li key={mod} className="flex items-center text-xs space-x-2 text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400">🔒</span>
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">¡Su plan actual tiene todos los módulos habilitados!</p>
                )}
              </div>
            </div>

            {/* Historial de Órdenes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">Historial de Órdenes de Suscripción</h3>
              {estado.historialOrdenes && estado.historialOrdenes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">N° Orden</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Monto</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Fecha Emisión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {estado.historialOrdenes.map((orden) => (
                        <tr key={orden.idOrden} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-800">{orden.numeroOrden}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{orden.nombrePlan}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">
                            ${Number(orden.montoTotal).toLocaleString('es-CO')} COP
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-700">
                              {orden.estadoOrden}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(orden.fechaEmision).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  Aún no registra órdenes previas de facturación.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
