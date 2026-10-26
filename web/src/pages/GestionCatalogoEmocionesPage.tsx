import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Palette,
  LogOut,
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';
import { IconoEmocionLucide, ICONOS_LUCIDE_CATALOGO } from '../components/IconoEmocionLucide';
import {
  listarEmocionesAdmin,
  agregarEmocionAdmin,
  modificarEmocionAdmin,
  desactivarEmocionAdmin,
  activarEmocionAdmin
} from '../services/apiAdmin';
import { EmocionAdmin, CrearEmocionSolicitud, ModificarEmocionSolicitud, ErrorApiAdmin } from '../types/admin';

export const GestionCatalogoEmocionesPage: React.FC = () => {
  const { sesion, cerrarSesion } = useAuthAdmin();
  const navigate = useNavigate();
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
  const [idEditadoManualmente, setIdEditadoManualmente] = useState(false);
  const [formEtiqueta, setFormEtiqueta] = useState('');
  const [formColor, setFormColor] = useState('#10B981');
  const [formFondo, setFormFondo] = useState('#D1FAE5');
  const [formIcono, setFormIcono] = useState('Smile');
  const [formDescripcion, setFormDescripcion] = useState('');

  const normalizarIdEmocion = (valor: string): string =>
    valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/gi, 'N')
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
      .replace(/[^A-Z0-9_]/g, '')
      .slice(0, 20);

  const formatearErrorApi = (err: unknown, mensajePorDefecto: string): string => {
    const errorApi = err as ErrorApiAdmin;
    if (errorApi?.detallesAdicionales && Object.keys(errorApi.detallesAdicionales).length > 0) {
      const detalles = Object.values(errorApi.detallesAdicionales).join('. ');
      if (detalles) return detalles;
    }
    return errorApi?.mensaje || mensajePorDefecto;
  };

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
    setIdEditadoManualmente(false);
    setFormEtiqueta('');
    setFormColor('#3B82F6');
    setFormFondo('#DBEAFE');
    setFormIcono('Smile');
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
    setFormIcono(emocion.iconoSvg || 'Smile');
    setFormDescripcion(emocion.descripcion || '');
    setError(null);
    setExito(null);
    setModalEditarAbierto(true);
  };

  const manejarCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const idLimpio = normalizarIdEmocion(formId || formEtiqueta);
    if (!idLimpio || idLimpio.length < 2 || !formEtiqueta.trim() || !formColor.trim() || !formIcono.trim()) {
      setError('Por favor complete los campos obligatorios (el identificador debe tener al menos 2 caracteres).');
      return;
    }

    setProcesando(true);
    setError(null);
    setExito(null);

    try {
      const solicitud: CrearEmocionSolicitud = {
        idEmocion: idLimpio,
        nombreEtiqueta: formEtiqueta.trim().slice(0, 30),
        codigoHexColor: formColor.trim(),
        codigoHexFondo: formFondo.trim() || formColor.trim(),
        iconoSvg: formIcono.trim(),
        descripcion: formDescripcion.trim() ? formDescripcion.trim().slice(0, 150) : undefined,
      };

      const creada = await agregarEmocionAdmin(token, solicitud);
      setExito(`Emoción '${creada.nombreEtiqueta}' agregada exitosamente al catálogo.`);
      setModalCrearAbierto(false);
      await cargarCatalogo();
    } catch (err) {
      setError(formatearErrorApi(err, 'Error al agregar la emoción.'));
    } finally {
      setProcesando(false);
    }
  };

  const manejarEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emocionSeleccionada) return;
    if (!formEtiqueta.trim() || !formColor.trim() || !formIcono.trim()) {
      setError('Por favor complete los campos obligatorios.');
      return;
    }

    setProcesando(true);
    setError(null);
    setExito(null);

    try {
      const solicitud: ModificarEmocionSolicitud = {
        nombreEtiqueta: formEtiqueta.trim().slice(0, 30),
        codigoHexColor: formColor.trim(),
        codigoHexFondo: formFondo.trim() || formColor.trim(),
        iconoSvg: formIcono.trim(),
        descripcion: formDescripcion.trim() ? formDescripcion.trim().slice(0, 150) : undefined,
      };

      const modificada = await modificarEmocionAdmin(token, emocionSeleccionada.idEmocion, solicitud);
      setExito(`Emoción '${modificada.nombreEtiqueta}' actualizada exitosamente.`);
      setModalEditarAbierto(false);
      await cargarCatalogo();
    } catch (err) {
      setError(formatearErrorApi(err, 'Error al modificar la emoción.'));
    } finally {
      setProcesando(false);
    }
  };

  const manejarDesactivar = async (emocion: EmocionAdmin) => {
    if (!window.confirm(`¿Está seguro de desactivar la emoción '${emocion.nombreEtiqueta}'? (El catálogo requiere al menos 3 activas)`)) {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Barra de cabecera */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Volver al panel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  Gestión del Catálogo de Emociones
                </h1>
                <span className="text-[11px] text-slate-500">Módulo de Administración</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500">Admin: {sesion?.nombreCompleto}</span>
            <button
              onClick={abrirModalCrear}
              disabled={procesando}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Emoción</span>
            </button>
            <button
              onClick={async () => {
                await cerrarSesion();
                navigate('/admin/login');
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-600 transition cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de métrica de regla del catálogo */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <Palette className="w-4 h-4" />
              <span>Disponibilidad del Catálogo</span>
            </div>
            <p className="text-sm text-slate-600">
              El catálogo debe mantener siempre un mínimo de <strong className="text-slate-900">3 emociones activas</strong> para garantizar el funcionamiento del registro ciudadano.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-500">Activas actuales:</span>
            <span className={`font-mono font-bold text-sm ${totalActivas <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalActivas} / {emociones.length}
            </span>
          </div>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold">Error en la operación</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1">
              <p className="font-semibold">Operación exitosa</p>
              <p className="mt-0.5 opacity-90">{exito}</p>
            </div>
            <button onClick={() => setExito(null)} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <Smile className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-semibold text-slate-900">No hay emociones en el catálogo</p>
            <p className="text-xs text-slate-500 mt-1">Haga clic en 'Agregar Emoción' para crear una.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {emociones.map((emocion) => (
              <div
                key={emocion.idEmocion}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm ${
                  emocion.activo
                    ? 'border-slate-200 hover:border-amber-300 hover:shadow-md'
                    : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border"
                        style={{
                          backgroundColor: emocion.codigoHexFondo || emocion.codigoHexColor,
                          borderColor: emocion.codigoHexColor,
                        }}
                      >
                        <IconoEmocionLucide
                          icono={emocion.iconoSvg}
                          idEmocion={emocion.idEmocion}
                          color={emocion.codigoHexColor}
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {emocion.nombreEtiqueta}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            {emocion.idEmocion}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {emocion.iconoSvg || 'Smile'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        emocion.activo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {emocion.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {emocion.descripcion || 'Sin descripción contextual.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-4 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: emocion.codigoHexColor }}
                      ></div>
                      <span className="font-mono text-[11px] text-slate-700">{emocion.codigoHexColor}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto text-[11px] text-slate-500">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emocion.totalReportesAsociados} eventos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => abrirModalEditar(emocion)}
                    disabled={procesando}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 transition-all font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Modificar</span>
                  </button>

                  {emocion.activo ? (
                    <button
                      onClick={() => manejarDesactivar(emocion)}
                      disabled={procesando}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-all font-medium cursor-pointer"
                      title="Desactivar emoción (borrado lógico)"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                      <span>Desactivar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => manejarActivar(emocion)}
                      disabled={procesando}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs border border-emerald-200 transition-all font-medium cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>Agregar Nueva Emoción</span>
              </h2>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={manejarCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    ID Único (Inmutable)
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => {
                      setIdEditadoManualmente(true);
                      setFormId(normalizarIdEmocion(e.target.value));
                    }}
                    placeholder="CALMA"
                    maxLength={20}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                  />
                  <span className="text-[10px] text-slate-500">Se normaliza sin tildes ni espacios (Ej: ALEGRIA)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Etiqueta Visible
                  </label>
                  <input
                    type="text"
                    value={formEtiqueta}
                    onChange={(e) => {
                      const nuevoValor = e.target.value;
                      setFormEtiqueta(nuevoValor);
                      if (!idEditadoManualmente) {
                        setFormId(normalizarIdEmocion(nuevoValor));
                      }
                    }}
                    placeholder="Calma"
                    maxLength={30}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Ícono Oficial del Catálogo (Lucide)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner flex-shrink-0"
                      style={{ backgroundColor: formFondo, borderColor: formColor }}
                    >
                      <IconoEmocionLucide icono={formIcono} color={formColor} className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formIcono}
                      onChange={(e) => setFormIcono(e.target.value)}
                      placeholder="Smile"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                    {ICONOS_LUCIDE_CATALOGO.map((item) => {
                      const ItemIcon = item.Icono;
                      const seleccionado = formIcono.toLowerCase() === item.id.toLowerCase();
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormIcono(item.id)}
                          title={`${item.nombre} (${item.descripcion})`}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition cursor-pointer border ${
                            seleccionado
                              ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-sm'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] truncate max-w-full">{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Detalle contextual de la emoción..."
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* Vista previa */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm"
                  style={{ backgroundColor: formFondo, borderColor: formColor }}
                >
                  <IconoEmocionLucide icono={formIcono} color={formColor} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{formEtiqueta || 'Nombre'}</span>
                  <p className="text-[11px] text-slate-500">{formDescripcion || 'Vista previa visual'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <span>Modificar Emoción: {emocionSeleccionada.idEmocion}</span>
              </h2>
              <button
                onClick={() => setModalEditarAbierto(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={manejarEditar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Etiqueta Visible
                </label>
                <input
                  type="text"
                  value={formEtiqueta}
                  onChange={(e) => setFormEtiqueta(e.target.value)}
                  maxLength={30}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Ícono Oficial del Catálogo (Lucide)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner flex-shrink-0"
                      style={{ backgroundColor: formFondo, borderColor: formColor }}
                    >
                      <IconoEmocionLucide icono={formIcono} color={formColor} className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formIcono}
                      onChange={(e) => setFormIcono(e.target.value)}
                      placeholder="Smile"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                    {ICONOS_LUCIDE_CATALOGO.map((item) => {
                      const ItemIcon = item.Icono;
                      const seleccionado = formIcono.toLowerCase() === item.id.toLowerCase();
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormIcono(item.id)}
                          title={`${item.nombre} (${item.descripcion})`}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition cursor-pointer border ${
                            seleccionado
                              ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-sm'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] truncate max-w-full">{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* Vista previa */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm"
                  style={{ backgroundColor: formFondo, borderColor: formColor }}
                >
                  <IconoEmocionLucide icono={formIcono} color={formColor} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{formEtiqueta}</span>
                  <p className="text-[11px] text-slate-500">{formDescripcion || 'Vista previa visual'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
