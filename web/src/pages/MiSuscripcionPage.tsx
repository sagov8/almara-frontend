import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    let cancelado = false;

    const cargarEstado = async () => {
      if (!sesion?.tokenAcceso) {
        return;
      }
      setCargando(true);
      setErrorMensaje(null);
      try {
        const respuesta = await consultarMiEstadoSuscripcion(sesion.tokenAcceso);
        if (!cancelado) {
          setEstado(respuesta);
        }
      } catch (err: any) {
        if (!cancelado) {
          setErrorMensaje(err?.mensaje || 'No fue posible consultar el estado de la suscripción.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarEstado();

    return () => {
      cancelado = true;
    };
  }, [sesion]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera y Navegación rápida */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestión de Mi Suscripción SaaS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Consulte la vigencia, módulos autorizados e historial de órdenes de su institución.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/institutional/dashboard')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium rounded-xl transition cursor-pointer"
            >
              ← Volver al Panel
            </button>
            <button
              onClick={() => navigate('/institutional/planes')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-xs text-white font-semibold rounded-xl transition shadow shadow-sky-600/20 cursor-pointer"
            >
              Ver Catálogo de Planes
            </button>
          </div>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Verificando estado de suscripción y licencias...</p>
          </div>
        )}

        {/* Estado de Error */}
        {errorMensaje && !cargando && (
          <div className="max-w-md mx-auto bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 text-center space-y-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-rose-200">{errorMensaje}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Reintentar
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
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Módulos Habilitados ({estado.modulosHabilitados.length})</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Acceso Total
                  </span>
                </div>
                {estado.modulosHabilitados.length > 0 ? (
                  <ul className="space-y-2.5">
                    {estado.modulosHabilitados.map((mod) => (
                      <li key={mod} className="flex items-center text-xs space-x-2 text-slate-200 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60">
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                        <span className="font-semibold">{mod}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No hay módulos habilitados con el estado actual.</p>
                )}
              </div>

              {/* Módulos Restringidos */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block"></span>
                    <span>Módulos Restringidos ({estado.modulosRestringidos.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Requiere Mejora
                  </span>
                </div>
                {estado.modulosRestringidos.length > 0 ? (
                  <ul className="space-y-2.5">
                    {estado.modulosRestringidos.map((mod) => (
                      <li key={mod} className="flex items-center text-xs space-x-2 text-slate-400 bg-slate-800/20 p-2.5 rounded-xl border border-slate-800/40">
                        <span className="text-slate-500">🔒</span>
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">¡Su plan actual tiene todos los módulos habilitados!</p>
                )}
              </div>
            </div>

            {/* Historial de Órdenes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Historial de Órdenes de Suscripción</h3>
              {estado.historialOrdenes && estado.historialOrdenes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">N° Orden</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Monto</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Fecha Emisión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {estado.historialOrdenes.map((orden) => (
                        <tr key={orden.idOrden} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-300">{orden.numeroOrden}</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">{orden.nombrePlan}</td>
                          <td className="py-3 px-4 text-slate-200">
                            ${Number(orden.montoTotal).toLocaleString('es-CO')} COP
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-300">
                              {orden.estadoOrden}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(orden.fechaEmision).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-800/20 rounded-xl border border-slate-800/40">
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
