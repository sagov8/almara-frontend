import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Hexagon,
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Shield,
  FileCode,
  Sparkles,
  Check,
  LogOut,
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

interface EscalaH3Visual {
  res: number;
  nivel: string;
  areaAprox: string;
  radioAprox: string;
  descripcion: string;
}

const ESCALAS_H3: EscalaH3Visual[] = [
  {
    res: 7,
    nivel: 'Macro-Sector Urbano',
    areaAprox: '~5.16 km²',
    radioAprox: '~1.22 km',
    descripcion: 'Agrupa comunas enteras de Popayán. Máxima agregación para vistas panorámicas.',
  },
  {
    res: 8,
    nivel: 'Barrios y Comunas',
    areaAprox: '~0.73 km²',
    radioAprox: '~461 m',
    descripcion: 'Equilibrio entre resolución urbana y anonimato. Apto para análisis por comuna.',
  },
  {
    res: 9,
    nivel: 'Sectores Vecinales (Recomendado)',
    areaAprox: '~0.10 km² (10.5 ha)',
    radioAprox: '~174 m',
    descripcion: 'Resolución estándar de Almara. Delimita manzanas y parques céntricos de Popayán.',
  },
  {
    res: 10,
    nivel: 'Micro-Zonas Urbanas',
    areaAprox: '~0.015 km² (1.5 ha)',
    radioAprox: '~65 m',
    descripcion: 'Detalle de esquinas o cuadras específicas. Requiere alto k-anonimato para visualizar.',
  },
];

// Plantillas GeoJSON precargadas de Popayán
const PLANTILLAS_POPAYAN = [
  {
    idSugerido: 'ZONA-CENTRO-HISTORICO',
    nombre: 'Comuna 4 - Centro Histórico',
    geoJson: JSON.stringify(
      {
        type: 'Polygon',
        coordinates: [
          [
            [-76.6085, 2.4415],
            [-76.6025, 2.4415],
            [-76.6025, 2.4468],
            [-76.6085, 2.4468],
            [-76.6085, 2.4415],
          ],
        ],
      },
      null,
      2
    ),
  },
  {
    idSugerido: 'ZONA-NORTE-COMERCIAL',
    nombre: 'Comuna 2 - Sector Campanario y La Estancia',
    geoJson: JSON.stringify(
      {
        type: 'Polygon',
        coordinates: [
          [
            [-76.595, 2.455],
            [-76.588, 2.455],
            [-76.588, 2.463],
            [-76.595, 2.463],
            [-76.595, 2.455],
          ],
        ],
      },
      null,
      2
    ),
  },
  {
    idSugerido: 'ZONA-SUR-RESIDENCIAL',
    nombre: 'Comuna 6 - Alfonso López y Santa Elena',
    geoJson: JSON.stringify(
      {
        type: 'Polygon',
        coordinates: [
          [
            [-76.615, 2.428],
            [-76.605, 2.428],
            [-76.605, 2.435],
            [-76.615, 2.435],
            [-76.615, 2.428],
          ],
        ],
      },
      null,
      2
    ),
  },
];

export const GestionZonasH3Page: React.FC = () => {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuthAdmin();
  const token = sesion?.token || '';

  // Estados de datos
  const [configH3, setConfigH3] = useState<ConfiguracionEspacialH3 | null>(null);
  const [poligonos, setPoligonos] = useState<PoligonoUrbano[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Estados de resolución espacial
  const [resolucionSeleccionada, setResolucionSeleccionada] = useState<number>(9);
  const [justificacionRes, setJustificacionRes] = useState<string>('');
  const [guardandoRes, setGuardandoRes] = useState<boolean>(false);

  // Estados para modal de polígono (crear / editar)
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [idZona, setIdZona] = useState<string>('');
  const [nombreZona, setNombreZona] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [geometriaGeoJson, setGeometriaGeoJson] = useState<string>('');
  const [resolucionH3, setResolucionH3] = useState<number>(9);
  const [activo, setActivo] = useState<boolean>(true);
  const [justificacionPoligono, setJustificacionPoligono] = useState<string>('');
  const [guardandoPoligono, setGuardandoPoligono] = useState<boolean>(false);

  // Validación en caliente de GeoJSON
  const [geoJsonValido, setGeoJsonValido] = useState<boolean | null>(null);
  const [errorGeoJson, setErrorGeoJson] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!token) return;
    try {
      setCargando(true);
      setMensajeError(null);
      const [config, lista] = await Promise.all([
        obtenerConfiguracionResolucionH3Admin(token),
        listarPoligonosUrbanosAdmin(token),
      ]);
      setConfigH3(config);
      setResolucionSeleccionada(config.resolucionH3Default);
      setPoligonos(lista);
    } catch (err: any) {
      console.error('Error al cargar datos espaciales:', err);
      setMensajeError(err?.mensaje || err?.message || 'Error al cargar datos espaciales H3.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Validar GeoJSON cuando cambia el contenido en el modal
  useEffect(() => {
    if (!geometriaGeoJson.trim()) {
      setGeoJsonValido(null);
      setErrorGeoJson(null);
      return;
    }
    validarGeoJson(geometriaGeoJson);
  }, [geometriaGeoJson]);

  const validarGeoJson = (texto: string) => {
    try {
      const obj = JSON.parse(texto);
      if (obj.type !== 'Polygon') {
        setGeoJsonValido(false);
        setErrorGeoJson("El GeoJSON debe ser de tipo 'Polygon'.");
        return;
      }
      if (!Array.isArray(obj.coordinates) || obj.coordinates.length === 0) {
        setGeoJsonValido(false);
        setErrorGeoJson("Debe incluir al menos un anillo de coordenadas en 'coordinates'.");
        return;
      }
      const ring = obj.coordinates[0];
      if (!Array.isArray(ring) || ring.length < 4) {
        setGeoJsonValido(false);
        setErrorGeoJson('Un polígono cerrado requiere al menos 4 puntos (3 vértices + cierre).');
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
      setMensajeError('Debe ingresar una justificación técnica para el log de auditoría');
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
      setMensajeError('Debe proporcionar una justificación técnica para el log de auditoría.');
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
    if (!window.confirm(`¿Está seguro de desactivar el polígono urbano [${p.nombreZona}]?`)) {
      return;
    }
    if (!token) return;

    try {
      setMensajeError(null);
      setMensajeExito(null);
      await desactivarPoligonoUrbanoAdmin(
        token,
        p.idZona,
        'Desactivación preventiva de sector urbano desde panel de administración.'
      );
      setPoligonos((prev) =>
        prev.map((item) => (item.idZona === p.idZona ? { ...item, activo: false } : item))
      );
      setMensajeExito(`Polígono [${p.idZona}] desactivado del mapa.`);
    } catch (err: any) {
      setMensajeError(err?.mensaje || err?.message || 'Error al desactivar el polígono.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Barra superior de navegación */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Volver al panel principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight">Zonas Geográficas H3</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:inline">Admin: {sesion?.nombreCompleto}</span>
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer disabled:opacity-50"
              title="Refrescar datos espaciales"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
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

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Notificaciones */}
        {mensajeExito && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Operación exitosa:</span>
              <p className="text-xs text-emerald-700 mt-0.5">{mensajeExito}</p>
            </div>
            <button
              onClick={() => setMensajeExito(null)}
              className="text-emerald-500 hover:text-emerald-800 text-xs font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {mensajeError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error en la operación:</span>
              <p className="text-xs text-rose-700 mt-0.5">{mensajeError}</p>
            </div>
            <button
              onClick={() => setMensajeError(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Sección 1: Calibración de Resolución Espacial H3 */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Hexagon className="w-4 h-4" />
                <span>Indexación Hexagonal Uber H3 Core</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Resolución H3 por Defecto: <span className="text-amber-600 font-mono">Nivel {configH3?.resolucionH3Default ?? 9}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Define el tamaño geométrico estándar de las celdas agregadas sobre Popayán. Rango operativo regulado entre <strong className="text-slate-900">7 y 10</strong> para salvaguardar el principio de anonimato.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rango regulado: <b className="text-slate-900 font-mono">7 ≤ Res ≤ 10</b></span>
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
                      ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-slate-200 text-slate-700">
                        Nivel {escala.res}
                      </span>
                      {esActiva && (
                        <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Seleccionada
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-900 block">{escala.nivel}</span>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{escala.descripcion}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Área: <b className="text-slate-800">{escala.areaAprox}</b></span>
                    <span>Radio: <b className="text-slate-800">{escala.radioAprox}</b></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario de aplicación de resolución */}
          <form onSubmit={manejarGuardarResolucion} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Justificación Técnica para Auditoría (Requerida *):
                </label>
                <input
                  type="text"
                  value={justificacionRes}
                  onChange={(e) => setJustificacionRes(e.target.value)}
                  placeholder="Ej: Calibración espacial macro para planificación urbana de Popayán"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-sm"
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
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>Base de Datos Espacial (PostGIS / OGC)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Polígonos Urbanos Delimitados en Popayán
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Geometrías poligonales cerradas GeoJSON indexadas mediante funciones geométricas espaciales nativas.
              </p>
            </div>

            <button
              onClick={abrirModalCrear}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Delimitar Polígono</span>
            </button>
          </div>

          {/* Tabla de Polígonos */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Identificador</th>
                  <th className="px-4 py-3 font-semibold">Nombre y Sector</th>
                  <th className="px-4 py-3 font-semibold">Centroide GPS</th>
                  <th className="px-4 py-3 font-semibold">Indexación H3</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {poligonos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron polígonos espaciales registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  poligonos.map((p) => (
                    <tr key={p.idZona} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-amber-700">
                        {p.idZona}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{p.nombreZona}</span>
                        <span className="text-[11px] text-slate-500">{p.descripcion || 'Sin descripción'}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {p.latitudCentroide.toFixed(4)}, {p.longitudCentroide.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sky-700 font-bold block">{p.idCeldaH3Centroide}</span>
                        <span className="text-[10px] text-slate-500">
                          Res {p.resolucionH3} (~{p.totalCeldasH3Cubiertas} celdas)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.activo ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => abrirModalEditar(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-700 hover:text-sky-900 transition cursor-pointer"
                          title="Modificar geometría o sector"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {p.activo && (
                          <button
                            onClick={() => manejarDesactivar(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {modoEdicion ? `Modificar Polígono [${idZona}]` : 'Delimitar Nuevo Polígono Urbano'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardarPoligono} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ID Zona (Clave Única *):
                  </label>
                  <input
                    type="text"
                    disabled={modoEdicion}
                    value={idZona}
                    onChange={(e) => setIdZona(e.target.value.toUpperCase())}
                    placeholder="ZONA-COMUNA-X"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono uppercase focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:opacity-75 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Sector / Polígono *:
                  </label>
                  <input
                    type="text"
                    value={nombreZona}
                    onChange={(e) => setNombreZona(e.target.value)}
                    placeholder="Comuna 4 - Centro Histórico"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción Territorial:
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Límites barriales, hitos arquitectónicos o área de influencia..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none shadow-sm"
                />
              </div>

              {/* Plantillas rápidas */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
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
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 transition cursor-pointer"
                    >
                      {plantilla.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor de Geometría GeoJSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Geometría GeoJSON (Polygon RFC 7946 / PostGIS *):
                  </label>
                  {geoJsonValido === true && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Polígono Cerrado Válido
                    </span>
                  )}
                  {geoJsonValido === false && (
                    <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> {errorGeoJson}
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={geometriaGeoJson}
                  onChange={(e) => setGeometriaGeoJson(e.target.value)}
                  placeholder='{"type":"Polygon","coordinates":[[[-76.608,2.441],[-76.603,2.441],[-76.603,2.447],[-76.608,2.447],[-76.608,2.441]]]}'
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-slate-900 font-mono text-[11px] focus:outline-none resize-none shadow-sm ${
                    geoJsonValido === true
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : geoJsonValido === false
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-300 focus:border-sky-500'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resolución Espacial H3:
                  </label>
                  <select
                    value={resolucionH3}
                    onChange={(e) => setResolucionH3(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none shadow-sm"
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
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="check-activo" className="text-xs text-slate-700 font-semibold cursor-pointer">
                      Polígono Activo en Mapas
                    </label>
                  </div>
                )}
              </div>

              {/* Justificación obligatoria para auditoría */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Justificación Técnica de Auditoría (Requerida *):
                </label>
                <input
                  type="text"
                  value={justificacionPoligono}
                  onChange={(e) => setJustificacionPoligono(e.target.value)}
                  placeholder="Ej: Delimitación de polígono aprobada por acuerdo de planeación urbana"
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900 text-xs outline-none shadow-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPoligono || geoJsonValido === false}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-sm"
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
