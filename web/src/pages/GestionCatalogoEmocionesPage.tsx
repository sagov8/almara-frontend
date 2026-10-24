import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Smile,
  Plus,
  Edit2,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  X,
  History,
  Palette
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';
import {
  listarEmocionesAdmin,
  agregarEmocionAdmin,
  modificarEmocionAdmin,
  desactivarEmocionAdmin,
  activarEmocionAdmin
} from '../services/apiAdmin';
import { EmocionAdmin, CrearEmocionSolicitud, ModificarEmocionSolicitud, ErrorApiAdmin } from '../types/admin';

export const GestionCatalogoEmocionesPage: React.FC = () => {
  const { sesion } = useAuthAdmin();
  const token = sesion?.token || '';

  const [emociones, setEmociones] = useState<EmocionAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  // Estados de Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<EmocionAdmin | null>(null);

  // Campos de formulario
  const [formId, setFormId] = useState('');
  const [formEtiqueta, setFormEtiqueta] = useState('');
  const [formColor, setFormColor] = useState('#10B981');
  const [formFondo, setFormFondo] = useState('#D1FAE5');
  const [formIcono, setFormIcono] = useState('😊');
  const [formDescripcion, setFormDescripcion] = useState('');

  const emojisSugeridos = ['😊', '😐', '😟', '😠', '😰', '😌', '🥳', '😢', '🤩', '😴', '❤️', '🔥'];

  const cargarCatalogo = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      const data = await listarEmocionesAdmin(token);
      setEmociones(data);
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      setError(errorApi.mensaje || 'Error al cargar el catálogo de emociones.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);

  const abrirModalCrear = () => {
    setFormId('');
    setFormEtiqueta('');
    setFormColor('#3B82F6');
    setFormFondo('#DBEAFE');
    setFormIcono('😌');
    setFormDescripcion('');
    setError(null);
    setExito(null);
    setModalCrearAbierto(true);
  };

  const abrirModalEditar = (emocion: EmocionAdmin) => {
    setEmocionSeleccionada(emocion);
    setFormEtiqueta(emocion.nombreEtiqueta);
    setFormColor(emocion.codigoHexColor);
    setFormFondo(emocion.codigoHexFondo || emocion.codigoHexColor);
    setFormIcono(emocion.iconoSvg);
    setFormDescripcion(emocion.descripcion || '');
    setError(null);
    setExito(null);
    setModalEditarAbierto(true);
  };

  const manejarCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formEtiqueta.trim() || !formColor.trim() || !formIcono.trim()) {
      setError('Por favor complete los campos obligatorios.');
      return;
    }

    setProcesando(true);
    setError(null);
    try {
      const solicitud: CrearEmocionSolicitud = {
        idEmocion: formId.trim().toUpperCase(),
        nombreEtiqueta: formEtiqueta.trim(),
        codigoHexColor: formColor.trim(),
        codigoHexFondo: formFondo.trim() || formColor.trim(),
        iconoSvg: formIcono.trim(),
        descripcion: formDescripcion.trim(),
      };

      await agregarEmocionAdmin(token, solicitud);
      setExito(`Emoción '${solicitud.nombreEtiqueta}' agregada al catálogo exitosamente (HU-12).`);
      setModalCrearAbierto(false);
      await cargarCatalogo();
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      setError(errorApi.mensaje || 'Error al agregar la emoción.');
    } finally {
      setProcesando(false);
    }
  };

  const manejarEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emocionSeleccionada || !formEtiqueta.trim() || !formColor.trim() || !formIcono.trim()) {
      setError('Por favor complete los campos obligatorios.');
      return;
    }

    setProcesando(true);
    setError(null);
    try {
      const solicitud: ModificarEmocionSolicitud = {
        nombreEtiqueta: formEtiqueta.trim(),
        codigoHexColor: formColor.trim(),
        codigoHexFondo: formFondo.trim() || formColor.trim(),
        iconoSvg: formIcono.trim(),
        descripcion: formDescripcion.trim(),
      };

      await modificarEmocionAdmin(token, emocionSeleccionada.idEmocion, solicitud);
      setExito(`Emoción '${emocionSeleccionada.idEmocion}' actualizada exitosamente.`);
      setModalEditarAbierto(false);
      await cargarCatalogo();
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      setError(errorApi.mensaje || 'Error al modificar la emoción.');
    } finally {
      setProcesando(false);
    }
  };

  const manejarDesactivar = async (emocion: EmocionAdmin) => {
    if (!window.confirm(`¿Está seguro de desactivar la emoción '${emocion.nombreEtiqueta}'? (Borrado lógico - HU-12)`)) {
      return;
    }

    setProcesando(true);
    setError(null);
    try {
      await desactivarEmocionAdmin(token, emocion.idEmocion);
      setExito(`Emoción '${emocion.nombreEtiqueta}' desactivada exitosamente.`);
      await cargarCatalogo();
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      setError(errorApi.mensaje || 'Error al desactivar la emoción.');
    } finally {
      setProcesando(false);
    }
  };

  const manejarActivar = async (emocion: EmocionAdmin) => {
    setProcesando(true);
    setError(null);
    try {
      await activarEmocionAdmin(token, emocion.idEmocion);
      setExito(`Emoción '${emocion.nombreEtiqueta}' activada exitosamente.`);
      await cargarCatalogo();
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      setError(errorApi.mensaje || 'Error al reactivar la emoción.');
    } finally {
      setProcesando(false);
    }
  };

  const totalActivas = emociones.filter((e) => e.activo).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Barra de cabecera */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Volver al panel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                  Gestión del Catálogo de Emociones
                </h1>
                <span className="text-[11px] text-slate-400">HU-12 • Módulo de Administración</span>
              </div>
            </div>
          </div>

          <button
            onClick={abrirModalCrear}
            disabled={procesando}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Emoción</span>
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de métrica de regla RF-05 */}
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Palette className="w-4 h-4" />
              <span>Regla de Negocio RF-05</span>
            </div>
            <p className="text-sm text-slate-300">
              El catálogo debe mantener siempre un mínimo de <strong className="text-white">3 emociones activas</strong> para garantizar el funcionamiento del registro ciudadano.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Activas actuales:</span>
            <span className={`font-mono font-bold text-sm ${totalActivas <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalActivas} / {emociones.length}
            </span>
          </div>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">Error en la operación</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold">Operación exitosa</p>
              <p className="mt-0.5 opacity-90">{exito}</p>
            </div>
            <button onClick={() => setExito(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabla / Lista de Emociones */}
        {cargando ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm">Cargando catálogo oficial de emociones...</span>
          </div>
        ) : emociones.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Smile className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-white">No hay emociones en el catálogo</p>
            <p className="text-xs text-slate-500 mt-1">Haga clic en 'Agregar Emoción' para crear una.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {emociones.map((emocion) => (
              <div
                key={emocion.idEmocion}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  emocion.activo
                    ? 'border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20'
                    : 'border-slate-800/60 opacity-60 bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                        style={{
                          backgroundColor: emocion.codigoHexFondo || emocion.codigoHexColor,
                          borderColor: emocion.codigoHexColor,
                        }}
                      >
                        <span>{emocion.iconoSvg}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                          {emocion.nombreEtiqueta}
                        </h3>
                        <span className="text-[11px] font-mono font-semibold text-slate-400">
                          {emocion.idEmocion}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        emocion.activo
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {emocion.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {emocion.descripcion || 'Sin descripción contextual.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: emocion.codigoHexColor }}
                      ></div>
                      <span className="font-mono text-[11px]">{emocion.codigoHexColor}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto text-[11px]">
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>{emocion.totalReportesAsociados} eventos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => abrirModalEditar(emocion)}
                    disabled={procesando}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-all font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modificar</span>
                  </button>

                  {emocion.activo ? (
                    <button
                      onClick={() => manejarDesactivar(emocion)}
                      disabled={procesando}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/70 hover:text-rose-300 text-xs text-slate-400 border border-transparent hover:border-rose-800 transition-all font-medium"
                      title="Desactivar emoción (borrado lógico)"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                      <span>Desactivar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => manejarActivar(emocion)}
                      disabled={procesando}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs border border-emerald-800/60 transition-all font-medium"
                      title="Reactivar emoción en el catálogo"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Activar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Emoción */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Agregar Nueva Emoción (HU-12)</span>
              </h2>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    ID Único (Inmutable)
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toUpperCase())}
                    placeholder="CALMA"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Ej: CALMA, SORPRESA</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Etiqueta Visible
                  </label>
                  <input
                    type="text"
                    value={formEtiqueta}
                    onChange={(e) => setFormEtiqueta(e.target.value)}
                    placeholder="Calma"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Color Hex (#RRGGBB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value.toUpperCase())}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value.toUpperCase())}
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Color Fondo (#RRGGBB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formFondo}
                      onChange={(e) => setFormFondo(e.target.value.toUpperCase())}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formFondo}
                      onChange={(e) => setFormFondo(e.target.value.toUpperCase())}
                      placeholder="#DBEAFE"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Ícono o Emoji SVG
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={formIcono}
                    onChange={(e) => setFormIcono(e.target.value)}
                    placeholder="😌"
                    required
                    className="w-20 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center text-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {emojisSugeridos.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcono(emoji)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Detalle contextual de la emoción..."
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Vista previa */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
                  style={{ backgroundColor: formFondo, borderColor: formColor }}
                >
                  {formIcono}
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{formEtiqueta || 'Nombre'}</span>
                  <p className="text-[11px] text-slate-400">{formDescripcion || 'Vista previa visual'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {procesando ? 'Guardando...' : 'Guardar Emoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modificar Emoción */}
      {modalEditarAbierto && emocionSeleccionada && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Modificar Emoción: {emocionSeleccionada.idEmocion}</span>
              </h2>
              <button
                onClick={() => setModalEditarAbierto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarEditar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Etiqueta Visible
                </label>
                <input
                  type="text"
                  value={formEtiqueta}
                  onChange={(e) => setFormEtiqueta(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Color Hex (#RRGGBB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value.toUpperCase())}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value.toUpperCase())}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Color Fondo (#RRGGBB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formFondo}
                      onChange={(e) => setFormFondo(e.target.value.toUpperCase())}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formFondo}
                      onChange={(e) => setFormFondo(e.target.value.toUpperCase())}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Ícono o Emoji SVG
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={formIcono}
                    onChange={(e) => setFormIcono(e.target.value)}
                    required
                    className="w-20 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center text-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {emojisSugeridos.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcono(emoji)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Vista previa */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
                  style={{ backgroundColor: formFondo, borderColor: formColor }}
                >
                  {formIcono}
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{formEtiqueta}</span>
                  <p className="text-[11px] text-slate-400">{formDescripcion || 'Vista previa visual'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {procesando ? 'Actualizando...' : 'Actualizar Emoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
