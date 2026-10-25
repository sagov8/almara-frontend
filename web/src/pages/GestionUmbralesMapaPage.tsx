import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Sliders,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';
import {
  ConfiguracionUmbralMapa,
  ActualizarUmbralMapaSolicitud,
  ErrorApiAdmin,
} from '../types/admin';
import {
  obtenerConfiguracionUmbralesAdmin,
  actualizarConfiguracionUmbralesAdmin,
  restablecerUmbralesAdmin,
} from '../services/apiAdmin';

interface ZonaSimulacion {
  nombre: string;
  sector: string;
  reportes: number;
  emocionPredominante: string;
  colorHex: string;
  icono: string;
}

const ZONAS_SIMULACION_POPAYAN: ZonaSimulacion[] = [
  {
    nombre: 'Parque Caldas',
    sector: 'Centro Histórico (Comuna 4)',
    reportes: 28,
    emocionPredominante: 'ALEGRÍA',
    colorHex: '#10B981',
    icono: '😊',
  },
  {
    nombre: 'El Empedrado',
    sector: 'Sector Tradicional (Comuna 4)',
    reportes: 14,
    emocionPredominante: 'TRANQUILIDAD',
    colorHex: '#3B82F6',
    icono: '🌿',
  },
  {
    nombre: 'Pandiguando',
    sector: 'Zona Residencial (Comuna 7)',
    reportes: 8,
    emocionPredominante: 'CURIOSIDAD',
    colorHex: '#F59E0B',
    icono: '💡',
  },
  {
    nombre: 'Yanaconas',
    sector: 'Periferia Rural Oriental',
    reportes: 3,
    emocionPredominante: 'CALMA',
    colorHex: '#8B5CF6',
    icono: '🕊️',
  },
];

export const GestionUmbralesMapaPage: React.FC = () => {
  const navigate = useNavigate();
  const { sesion } = useAuthAdmin();
  const token = sesion?.token;

  const [configuracion, setConfiguracion] = useState<ConfiguracionUmbralMapa | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Formulario de calibración
  const [umbralK, setUmbralK] = useState<number>(5);
  const [tiempoRecalculo, setTiempoRecalculo] = useState<number>(60);
  const [modoEstricto, setModoEstricto] = useState<boolean>(true);
  const [mensajeProteccion, setMensajeProteccion] = useState<string>('');
  const [justificacionAuditoria, setJustificacionAuditoria] = useState<string>('');

  const [mostrarModalRestablecer, setMostrarModalRestablecer] = useState<boolean>(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    if (!token) return;
    try {
      setCargando(true);
      setMensajeError(null);
      const data = await obtenerConfiguracionUmbralesAdmin(token);
      setConfiguracion(data);
      setUmbralK(data.umbralMinimoK);
      setTiempoRecalculo(data.tiempoRecalculoSegundos);
      setModoEstricto(data.modoEstricto);
      setMensajeProteccion(data.mensajeProteccion);
    } catch (err: any) {
      console.error('Error al cargar configuración de umbrales:', err);
      const msg = err?.mensaje || err?.message || 'Error al cargar los umbrales del mapa';
      setMensajeError(msg);
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!justificacionAuditoria.trim()) {
      setMensajeError('Debe ingresar una justificación técnica para el log de auditoría (RNF-13)');
      return;
    }

    if (umbralK < 5) {
      setMensajeError('El umbral de k-anonimato no puede ser inferior a 5 para garantizar la privacidad ciudadana');
      return;
    }

    if (tiempoRecalculo < 10) {
      setMensajeError('El tiempo de recálculo debe ser de al menos 10 segundos');
      return;
    }

    try {
      setGuardando(true);
      setMensajeError(null);
      setMensajeExito(null);

      const mensajeDefecto =
        'Protección en Comunidad: Para cuidar tu privacidad, las zonas solo se colorean en el mapa cuando al menos 5 vecinos han compartido cómo se sienten en ese lugar. Tu participación es 100% anónima.';

      const solicitud: ActualizarUmbralMapaSolicitud = {
        umbralMinimoK: umbralK,
        tiempoRecalculoSegundos: tiempoRecalculo,
        modoEstricto,
        mensajeProteccion: mensajeProteccion?.trim() ? mensajeProteccion.trim() : mensajeDefecto,
        justificacionAuditoria: justificacionAuditoria.trim(),
      };

      const actualizada = await actualizarConfiguracionUmbralesAdmin(token, solicitud);
      setConfiguracion(actualizada);
      setJustificacionAuditoria('');
      setMensajeExito(
        `Umbral actualizado en caliente a k=${actualizada.umbralMinimoK}. ` +
        `Las celdas con menos reportes pasarán a reserva de privacidad automáticamente.`
      );
    } catch (err: any) {
      console.error('Error al actualizar umbral:', err);
      let detalleError = 'No se pudo actualizar el umbral del mapa';
      if (err?.detallesAdicionales && Object.keys(err.detallesAdicionales).length > 0) {
        detalleError = `${err.mensaje || 'Validación fallida'}: ${Object.values(err.detallesAdicionales).join(' | ')}`;
      } else if (err?.mensaje) {
        detalleError = err.mensaje;
      } else if (err?.message) {
        detalleError = err.message;
      }
      setMensajeError(detalleError);
    } finally {
      setGuardando(false);
    }
  };

  const manejarRestablecerValores = async () => {
    if (!token) return;
    try {
      setGuardando(true);
      setMensajeError(null);
      const restablecida = await restablecerUmbralesAdmin(
        token,
        'Restablecimiento administrativo a parámetros base por defecto de Popayán (k=5)'
      );
      setConfiguracion(restablecida);
      setUmbralK(restablecida.umbralMinimoK);
      setTiempoRecalculo(restablecida.tiempoRecalculoSegundos);
      setModoEstricto(restablecida.modoEstricto);
      setMensajeProteccion(restablecida.mensajeProteccion);
      setJustificacionAuditoria('');
      setMostrarModalRestablecer(false);
      setMensajeExito('Se han restablecido los parámetros de privacidad base por defecto (k=5).');
    } catch (err: any) {
      const error = err as ErrorApiAdmin;
      setMensajeError(error.mensaje || 'Error al restablecer los valores');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra superior de navegación */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Volver al panel principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">Umbrales del Mapa</span>
                <span className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  HU-13
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Admin: {sesion?.nombreCompleto}</span>
            <button
              onClick={cargarConfiguracion}
              disabled={cargando}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Refrescar estado actual"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Notificaciones */}
        {mensajeExito && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-sm flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">¡Parámetros actualizados con éxito!</span>
              <p className="text-xs text-emerald-300/90 mt-0.5">{mensajeExito}</p>
            </div>
            <button
              onClick={() => setMensajeExito(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {mensajeError && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error en la operación:</span>
              <p className="text-xs text-rose-300/90 mt-0.5">{mensajeError}</p>
            </div>
            <button
              onClick={() => setMensajeError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Resumen del Estado de Privacidad Activo */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" />
                <span>Política Activa de Privacidad y Agregación Espacial</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                k-Anonimato Territorial: <span className="text-amber-400 font-mono">k ≥ {configuracion?.umbralMinimoK ?? 5}</span> reportes
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Cualquier hexágono o zona de Popayán con un número menor a <span className="font-bold text-white">{configuracion?.umbralMinimoK ?? 5} reportes</span> oculta su coloración y entra en estado de reserva ciudadana (RF-23).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Recálculo: <b className="text-white font-mono">{configuracion?.tiempoRecalculoSegundos ?? 60}s</b></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modo: <b className="text-white">{configuracion?.modoEstricto ? 'Estricto' : 'Reserva suave'}</b></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-400">
                Por: <span className="text-slate-200">{configuracion?.actualizadoPor}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Formulario y Simulador en Paralelo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulario de Calibración (7 columnas) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Calibrar Parámetros en Caliente</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los cambios se propagan de forma atómica e inmediata a la memoria caché (&lt; 500 ms).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalRestablecer(true)}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Restablecer a valores iniciales"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Valores base</span>
              </button>
            </div>

            <form onSubmit={manejarGuardar} className="space-y-5">
              {/* Control de Umbral k con Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-slider-k" className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Umbral Mínimo $k$-Anonimato:
                  </label>
                  <span className="text-lg font-black font-mono text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    k = {umbralK}
                  </span>
                </div>

                <input
                  id="input-slider-k"
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={umbralK}
                  onChange={(e) => setUmbralK(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>5 (Mínimo técnico)</span>
                  <span>15 (Equilibrado)</span>
                  <span>25 (Alta reserva)</span>
                  <span>50 (Eventos masivos)</span>
                </div>

                {/* Botones de presets rápidos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Base (k=5)', valor: 5 },
                    { label: 'Equilibrado (k=15)', valor: 15 },
                    { label: 'Reserva (k=25)', valor: 25 },
                    { label: 'Masivo (k=50)', valor: 50 },
                  ].map((preset) => (
                    <button
                      key={preset.valor}
                      type="button"
                      onClick={() => setUmbralK(preset.valor)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        umbralK === preset.valor
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fila: Periodicidad de Recálculo y Modo Estricto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-tiempo-recalculo" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                    Tiempo de Recálculo (Segundos):
                  </label>
                  <input
                    id="input-tiempo-recalculo"
                    type="number"
                    min="10"
                    max="3600"
                    value={tiempoRecalculo}
                    onChange={(e) => setTiempoRecalculo(Math.max(10, parseInt(e.target.value, 10) || 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Mínimo 10s para evitar saturación de BD</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                    Modo Estricto de Protección:
                  </label>
                  <button
                    type="button"
                    onClick={() => setModoEstricto(!modoEstricto)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition cursor-pointer ${
                      modoEstricto
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{modoEstricto ? 'Ocultamiento Total (RF-23)' : 'Despliegue Suave con Escudo'}</span>
                    {modoEstricto ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                  <span className="text-[11px] text-slate-500 mt-1 block">Impide la inferencia de emociones aisladas</span>
                </div>
              </div>

              {/* Mensaje de Protección al Ciudadano */}
              <div>
                <label htmlFor="input-mensaje-proteccion" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Mensaje Visible de Protección Ciudadana:
                </label>
                <textarea
                  id="input-mensaje-proteccion"
                  rows={2}
                  value={mensajeProteccion}
                  onChange={(e) => setMensajeProteccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
                  placeholder="Mensaje explicativo para la ciudadanía..."
                  required
                />
              </div>

              {/* Justificación de Auditoría Obligatoria (RNF-13) */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <label htmlFor="input-justificacion-auditoria" className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Justificación Técnica para Auditoría (Requerida *):
                </label>
                <input
                  id="input-justificacion-auditoria"
                  type="text"
                  value={justificacionAuditoria}
                  onChange={(e) => setJustificacionAuditoria(e.target.value)}
                  placeholder="Ej: Calibración preventiva por evento cultural en Popayán"
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  required
                />
                <span className="text-[11px] text-amber-400/80 mt-1 block">
                  Quedará registrada de forma inmutable en la tabla <code className="font-mono text-white">auditoria_admin</code> (RNF-13).
                </span>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {guardando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Propagando en caliente...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Aplicar Umbral en Caliente (HU-13)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Simulador Interactivo de Celdas de Popayán (5 columnas) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>Simulador de Impacto en Popayán</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Comportamiento en Vivo con k = {umbralK}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visualice cómo el umbral seleccionado en el deslizador afecta la visibilidad de los sectores urbanos:
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {ZONAS_SIMULACION_POPAYAN.map((zona) => {
                const cumple = zona.reportes >= umbralK;
                return (
                  <div
                    key={zona.nombre}
                    className={`p-3.5 rounded-xl border transition-all ${
                      cumple
                        ? 'bg-slate-950/80 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-950/40 border-dashed border-rose-900/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{zona.icono}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{zona.nombre}</span>
                          <span className="text-[10px] text-slate-400">{zona.sector}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">
                          {zona.reportes} reportes
                        </span>
                        {cumple ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Visible ({zona.emocionPredominante})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                            <Lock className="w-3 h-3" />
                            <span>En Reserva (Oculta)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de progreso hacia el umbral */}
                    <div className="mt-2.5">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            cumple ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, (zona.reportes / umbralK) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{cumple ? 'Supera k' : `Faltan ${umbralK - zona.reportes} reportes`}</span>
                        <span className="font-mono">{Math.round((zona.reportes / umbralK) * 100)}% de k</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Regla RF-23:</strong> Si una zona no acumula al menos <span className="text-amber-300 font-mono">k reportes</span>, el mapa jamás divulgará emociones individuales para salvaguardar la intimidad de los habitantes.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmación para restablecer */}
      {mostrarModalRestablecer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">¿Restablecer valores por defecto?</h3>
              <p className="text-xs text-slate-300 mt-1.5">
                Esta acción volverá a configurar el umbral en <strong className="text-amber-400">k = 5</strong>, el tiempo de recálculo en 60 segundos y activará el modo estricto. Quedará registrado en la auditoría.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalRestablecer(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={manejarRestablecerValores}
                disabled={guardando}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                {guardando ? 'Restableciendo...' : 'Confirmar Restablecimiento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
