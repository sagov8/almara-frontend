import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Hexagon,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCode,
  Sparkles,
  Shield,
  Check,
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';
import {
  ConfiguracionEspacialH3,
  PoligonoUrbano,
  ActualizarResolucionH3Solicitud,
  CrearPoligonoUrbanoSolicitud,
  ModificarPoligonoUrbanoSolicitud,
} from '../types/admin';
import {
  obtenerConfiguracionResolucionH3Admin,
  actualizarResolucionH3Admin,
  listarPoligonosUrbanosAdmin,
  crearPoligonoUrbanoAdmin,
  modificarPoligonoUrbanoAdmin,
  desactivarPoligonoUrbanoAdmin,
} from '../services/apiAdmin';

const ESCALAS_H3 = [
  {
    res: 7,
    areaAprox: '~5.16 km²',
    radioAprox: '~1.22 km',
    nivel: 'Macro-territorial (Valles y Cuencas)',
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    descripcion: 'Agrupación muy amplia para análisis regional. Baja granularidad urbana.',
  },
  {
    res: 8,
    areaAprox: '~0.73 km²',
    radioAprox: '~460 m',
    nivel: 'Comunas y Macro-sectores',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    descripcion: 'División por comunas completas. Recomendada para informes gubernamentales.',
  },
  {
    res: 9,
    areaAprox: '~0.10 km²',
    radioAprox: '~174 m',
    nivel: 'Cuadrantes Urbanos (Estándar Popayán)',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    descripcion: 'Resolución por defecto calibrada. Equilibrio óptimo entre detalle y privacidad.',
  },
  {
    res: 10,
    areaAprox: '~0.015 km²',
    radioAprox: '~65 m',
    nivel: 'Micro-zonas Vecinales (Límite RF-09)',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    descripcion: 'Nivel máximo de detalle permitido para impedir la identificación de hogares.',
  },
];

const PLANTILLAS_POPAYAN = [
  {
    nombre: 'Centro Histórico (Comuna 4)',
    idSugerido: 'ZONA-COMUNA-4-CENTRO',
    geoJson:
      '{"type":"Polygon","coordinates":[[[-76.608,2.441],[-76.603,2.441],[-76.603,2.447],[-76.608,2.447],[-76.608,2.441]]]}',
  },
  {
    nombre: 'Sector Norte / Campanario (Comuna 2)',
    idSugerido: 'ZONA-COMUNA-2-NORTE',
    geoJson:
      '{"type":"Polygon","coordinates":[[[-76.598,2.455],[-76.590,2.455],[-76.590,2.468],[-76.598,2.468],[-76.598,2.455]]]}',
  },
  {
    nombre: 'Pandiguando / La Esmeralda (Comuna 7)',
    idSugerido: 'ZONA-COMUNA-7-OCCIDENTE',
    geoJson:
      '{"type":"Polygon","coordinates":[[[-76.625,2.435],[-76.615,2.435],[-76.615,2.445],[-76.625,2.445],[-76.625,2.435]]]}',
  },
];

export const GestionZonasH3Page: React.FC = () => {
  const navigate = useNavigate();
  const { sesion } = useAuthAdmin();
  const token = sesion?.token;

  // Estados de datos
  const [configH3, setConfigH3] = useState<ConfiguracionEspacialH3 | null>(null);
  const [poligonos, setPoligonos] = useState<PoligonoUrbano[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardandoRes, setGuardandoRes] = useState<boolean>(false);
  const [guardandoPoligono, setGuardandoPoligono] = useState<boolean>(false);

  // Mensajes de feedback
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Formulario Resolución H3
  const [resolucionSeleccionada, setResolucionSeleccionada] = useState<number>(9);
  const [justificacionRes, setJustificacionRes] = useState<string>('');

  // Estados del modal de polígonos
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [idZona, setIdZona] = useState<string>('');
  const [nombreZona, setNombreZona] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [geometriaGeoJson, setGeometriaGeoJson] = useState<string>('');
  const [resolucionH3, setResolucionH3] = useState<number>(9);
  const [activo, setActivo] = useState<boolean>(true);
  const [justificacionPoligono, setJustificacionPoligono] = useState<string>('');

  // Validación de GeoJSON en vivo
  const [geoJsonValido, setGeoJsonValido] = useState<boolean | null>(null);
  const [errorGeoJson, setErrorGeoJson] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    validarGeoJsonEnVivo(geometriaGeoJson);
  }, [geometriaGeoJson]);

  const cargarDatos = async () => {
    if (!token) return;
    try {
      setCargando(true);
      setMensajeError(null);
      const [dataConfig, dataPoligonos] = await Promise.all([
        obtenerConfiguracionResolucionH3Admin(token),
        listarPoligonosUrbanosAdmin(token),
      ]);
      setConfigH3(dataConfig);
      setResolucionSeleccionada(dataConfig.resolucionH3Default);
      setPoligonos(dataPoligonos);
    } catch (err: any) {
      console.error('Error al cargar datos espaciales:', err);
      setMensajeError(err?.mensaje || err?.message || 'Error al conectar con el servicio espacial.');
    } finally {
      setCargando(false);
    }
  };

  const validarGeoJsonEnVivo = (texto: string) => {
    if (!texto.trim()) {
      setGeoJsonValido(null);
      setErrorGeoJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(texto);
      let coords: any[] | null = null;

      if (parsed.type === 'Feature' && parsed.geometry?.type === 'Polygon') {
        coords = parsed.geometry.coordinates;
      } else if (parsed.type === 'Polygon') {
        coords = parsed.coordinates;
      }

      if (!coords || !Array.isArray(coords) || coords.length === 0) {
        setGeoJsonValido(false);
        setErrorGeoJson("El GeoJSON debe tener 'type': 'Polygon' con un array de coordenadas.");
        return;
      }

      const ring = coords[0];
      if (!Array.isArray(ring) || ring.length < 4) {
        setGeoJsonValido(false);
        setErrorGeoJson('Un polígono cerrado requiere al menos 4 puntos (primer punto == último punto).');
        return;
      }

      const pInicio = ring[0];
      const pFin = ring[ring.length - 1];

      if (pInicio[0] !== pFin[0] || pInicio[1] !== pFin[1]) {
        setGeoJsonValido(false);
        setErrorGeoJson(
          `Polígono abierto: El primer punto [${pInicio[0]}, ${pInicio[1]}] no coincide con el último [${pFin[0]}, ${pFin[1]}].`
        );
        return;
      }

      setGeoJsonValido(true);
      setErrorGeoJson(null);
    } catch {
      setGeoJsonValido(false);
      setErrorGeoJson('Sintaxis JSON inválida.');
    }
  };

  const manejarGuardarResolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!justificacionRes.trim()) {
      setMensajeError('Debe ingresar una justificación técnica para el log de auditoría (RNF-13)');
      return;
    }

    try {
      setGuardandoRes(true);
      setMensajeError(null);
      setMensajeExito(null);

      const solicitud: ActualizarResolucionH3Solicitud = {
        resolucionH3Default: resolucionSeleccionada,
        justificacionAuditoria: justificacionRes.trim(),
      };

      const actualizada = await actualizarResolucionH3Admin(token, solicitud);
      setConfigH3(actualizada);
      setJustificacionRes('');
      setMensajeExito(
        `Resolución espacial H3 por defecto actualizada a nivel ${actualizada.resolucionH3Default}. El mapa indexará las nuevas coordenadas en esta escala.`
      );
    } catch (err: any) {
      console.error('Error al actualizar resolución H3:', err);
      setMensajeError(err?.mensaje || err?.message || 'Error al actualizar la resolución H3.');
    } finally {
      setGuardandoRes(false);
    }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdZona('');
    setNombreZona('');
    setDescripcion('');
    setGeometriaGeoJson(PLANTILLAS_POPAYAN[0].geoJson);
    setResolucionH3(configH3?.resolucionH3Default || 9);
    setActivo(true);
    setJustificacionPoligono('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (p: PoligonoUrbano) => {
    setModoEdicion(true);
    setIdZona(p.idZona);
    setNombreZona(p.nombreZona);
    setDescripcion(p.descripcion || '');
    setGeometriaGeoJson(p.geometriaGeoJson);
    setResolucionH3(p.resolucionH3);
    setActivo(p.activo);
    setJustificacionPoligono('');
    setModalAbierto(true);
  };

  const manejarGuardarPoligono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!geoJsonValido) {
      setMensajeError('La geometría debe ser un polígono GeoJSON cerrado válido.');
      return;
    }

    if (!justificacionPoligono.trim()) {
      setMensajeError('Debe proporcionar una justificación técnica para el log de auditoría (RNF-13).');
      return;
    }

    try {
      setGuardandoPoligono(true);
      setMensajeError(null);
      setMensajeExito(null);

      if (modoEdicion) {
        const solicitud: ModificarPoligonoUrbanoSolicitud = {
          nombreZona: nombreZona.trim(),
          descripcion: descripcion.trim(),
          geometriaGeoJson: geometriaGeoJson.trim(),
          resolucionH3,
          activo,
          justificacionAuditoria: justificacionPoligono.trim(),
        };
        const actualizado = await modificarPoligonoUrbanoAdmin(token, idZona, solicitud);
        setPoligonos((prev) => prev.map((item) => (item.idZona === idZona ? actualizado : item)));
        setMensajeExito(`Polígono urbano [${idZona}] actualizado e indexado en PostGIS exitosamente.`);
      } else {
        const solicitud: CrearPoligonoUrbanoSolicitud = {
          idZona: idZona.trim().toUpperCase(),
          nombreZona: nombreZona.trim(),
          descripcion: descripcion.trim(),
          geometriaGeoJson: geometriaGeoJson.trim(),
          resolucionH3,
          justificacionAuditoria: justificacionPoligono.trim(),
        };
        const nuevo = await crearPoligonoUrbanoAdmin(token, solicitud);
        setPoligonos((prev) => [nuevo, ...prev]);
        setMensajeExito(`Polígono urbano [${nuevo.idZona}] creado e indexado en PostGIS exitosamente.`);
      }

      setModalAbierto(false);
    } catch (err: any) {
      console.error('Error al guardar polígono:', err);
      let errorMsg = err?.mensaje || err?.message || 'Error al guardar el polígono urbano.';
      if (err?.detallesAdicionales && Object.keys(err.detallesAdicionales).length > 0) {
        errorMsg += `: ${Object.values(err.detallesAdicionales).join(' | ')}`;
      }
      setMensajeError(errorMsg);
    } finally {
      setGuardandoPoligono(false);
    }
  };

  const manejarDesactivar = async (p: PoligonoUrbano) => {
    if (!token) return;
    const confirmacion = window.confirm(
      `¿Está seguro de desactivar el polígono urbano [${p.idZona}] "${p.nombreZona}"? Se aplicará borrado lógico y trazabilidad en auditoría.`
    );
    if (!confirmacion) return;

    try {
      setMensajeError(null);
      const desactivado = await desactivarPoligonoUrbanoAdmin(
        token,
        p.idZona,
        'Desactivación manual desde el panel de administración'
      );
      setPoligonos((prev) => prev.map((item) => (item.idZona === p.idZona ? desactivado : item)));
      setMensajeExito(`Polígono [${p.idZona}] desactivado correctamente (borrado lógico).`);
    } catch (err: any) {
      console.error('Error al desactivar polígono:', err);
      setMensajeError(err?.mensaje || err?.message || 'Error al desactivar el polígono.');
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
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">Zonas Geográficas H3</span>
                <span className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HU-14
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Admin: {sesion?.nombreCompleto}</span>
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Refrescar datos espaciales"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Notificaciones */}
        {mensajeExito && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-sm flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Operación exitosa:</span>
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

        {/* Sección 1: Calibración de Resolución Espacial H3 */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Hexagon className="w-4 h-4" />
                <span>Indexación Hexagonal Uber H3 Core</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Resolución H3 por Defecto: <span className="text-amber-400 font-mono">Nivel {configH3?.resolucionH3Default ?? 9}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Define el tamaño geométrico estándar de las celdas agregadas sobre Popayán. Rango operativo regulado entre <strong className="text-white">7 y 10</strong> para salvaguardar el principio de anonimato (RF-09).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Límites RF-09: <b className="text-white font-mono">7 ≤ Res ≤ 10</b></span>
              </span>
            </div>
          </div>

          {/* Tarjetas comparativas de resolución */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ESCALAS_H3.map((escala) => {
              const esActiva = resolucionSeleccionada === escala.res;
              return (
                <div
                  key={escala.res}
                  onClick={() => setResolucionSeleccionada(escala.res)}
                  role="button"
                  tabIndex={0}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    esActiva
                      ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-slate-800 text-slate-300">
                        Nivel {escala.res}
                      </span>
                      {esActiva && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Seleccionada
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-white block">{escala.nivel}</span>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{escala.descripcion}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Área: <b className="text-slate-200">{escala.areaAprox}</b></span>
                    <span>Radio: <b className="text-slate-200">{escala.radioAprox}</b></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario de aplicación de resolución */}
          <form onSubmit={manejarGuardarResolucion} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Justificación Técnica para Auditoría (Requerida *):
                </label>
                <input
                  type="text"
                  value={justificacionRes}
                  onChange={(e) => setJustificacionRes(e.target.value)}
                  placeholder="Ej: Calibración espacial macro para planificación urbana de Popayán"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="sm:w-64 flex items-end">
                <button
                  type="submit"
                  disabled={guardandoRes}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {guardandoRes ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fijar Resolución {resolucionSeleccionada}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Sección 2: Delimitación de Polígonos Urbanos (PostGIS) */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>Base de Datos Espacial (PostGIS / OGC)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Polígonos Urbanos Delimitados en Popayán
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Geometrías poligonales cerradas GeoJSON indexadas mediante funciones geométricas espaciales nativas.
              </p>
            </div>

            <button
              onClick={abrirModalCrear}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Delimitar Polígono</span>
            </button>
          </div>

          {/* Tabla de Polígonos */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Identificador</th>
                  <th className="px-4 py-3 font-semibold">Nombre y Sector</th>
                  <th className="px-4 py-3 font-semibold">Centroide GPS</th>
                  <th className="px-4 py-3 font-semibold">Indexación H3</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {poligonos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron polígonos espaciales registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  poligonos.map((p) => (
                    <tr key={p.idZona} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {p.idZona}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-white block">{p.nombreZona}</span>
                        <span className="text-[11px] text-slate-400">{p.descripcion || 'Sin descripción'}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {p.latitudCentroide.toFixed(4)}, {p.longitudCentroide.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sky-400 block">{p.idCeldaH3Centroide}</span>
                        <span className="text-[10px] text-slate-400">
                          Res {p.resolucionH3} (~{p.totalCeldasH3Cubiertas} celdas)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.activo ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => abrirModalEditar(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition cursor-pointer"
                          title="Modificar geometría o sector"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {p.activo && (
                          <button
                            onClick={() => manejarDesactivar(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Desactivar polígono (borrado lógico)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal de Creación / Edición de Polígono Espacial */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {modoEdicion ? `Modificar Polígono [${idZona}]` : 'Delimitar Nuevo Polígono Urbano'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardarPoligono} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    ID Zona (Clave Única *):
                  </label>
                  <input
                    type="text"
                    disabled={modoEdicion}
                    value={idZona}
                    onChange={(e) => setIdZona(e.target.value.toUpperCase())}
                    placeholder="ZONA-COMUNA-X"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:border-emerald-500 outline-none disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nombre del Sector / Polígono *:
                  </label>
                  <input
                    type="text"
                    value={nombreZona}
                    onChange={(e) => setNombreZona(e.target.value)}
                    placeholder="Comuna 4 - Centro Histórico"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descripción Territorial:
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Límites barriales, hitos arquitectónicos o área de influencia..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Plantillas rápidas */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cargar Plantilla de Popayán:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLANTILLAS_POPAYAN.map((plantilla) => (
                    <button
                      key={plantilla.idSugerido}
                      type="button"
                      onClick={() => {
                        if (!modoEdicion) setIdZona(plantilla.idSugerido);
                        setNombreZona(plantilla.nombre);
                        setGeometriaGeoJson(plantilla.geoJson);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                    >
                      {plantilla.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor de Geometría GeoJSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Geometría GeoJSON (Polygon RFC 7946 / PostGIS *):
                  </label>
                  {geoJsonValido === true && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Polígono Cerrado Válido
                    </span>
                  )}
                  {geoJsonValido === false && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errorGeoJson}
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={geometriaGeoJson}
                  onChange={(e) => setGeometriaGeoJson(e.target.value)}
                  placeholder='{"type":"Polygon","coordinates":[[[-76.608,2.441],[-76.603,2.441],[-76.603,2.447],[-76.608,2.447],[-76.608,2.441]]]}'
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-white font-mono text-[11px] focus:outline-none resize-none ${
                    geoJsonValido === true
                      ? 'border-emerald-500/80 focus:border-emerald-400'
                      : geoJsonValido === false
                      ? 'border-rose-500/80 focus:border-rose-400'
                      : 'border-slate-700 focus:border-sky-500'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Resolución Espacial H3:
                  </label>
                  <select
                    value={resolucionH3}
                    onChange={(e) => setResolucionH3(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                  >
                    <option value={7}>Nivel 7 (~5.16 km² - Macro)</option>
                    <option value={8}>Nivel 8 (~0.73 km² - Comunas)</option>
                    <option value={9}>Nivel 9 (~0.10 km² - Recomendado Popayán)</option>
                    <option value={10}>Nivel 10 (~0.015 km² - Micro-sectores)</option>
                  </select>
                </div>

                {modoEdicion && (
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="check-activo"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                    />
                    <label htmlFor="check-activo" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      Polígono Activo en Mapas
                    </label>
                  </div>
                )}
              </div>

              {/* Justificación obligatoria para auditoría */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Justificación Técnica de Auditoría (Requerida *):
                </label>
                <input
                  type="text"
                  value={justificacionPoligono}
                  onChange={(e) => setJustificacionPoligono(e.target.value)}
                  placeholder="Ej: Delimitación de polígono aprobada por acuerdo de planeación urbana"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-amber-500/50 rounded-lg text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPoligono || geoJsonValido === false}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {guardandoPoligono ? 'Guardando...' : modoEdicion ? 'Actualizar Polígono' : 'Guardar e Indexar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
