import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Lock,
  Shield,
  X,
  Radio,
  BarChart2,
} from 'lucide-react-native';
import {
  CeldaMapaEmocional,
  ConsultaMapaEmocionalRespuesta,
  consultarMapaPopayan,
  consultarTodasLasCeldas,
} from '../services/servicioMapa';
import { LeyendaEmociones } from './LeyendaEmociones';
import { IconoEmocion } from './IconoEmocion';
import { ModalDetalleZona } from './ModalDetalleZona';

interface PropiedadesMapa {
  onSeleccionarZona?: (celda: CeldaMapaEmocional) => void;
}

/**
 * Plantilla HTML con Leaflet y OpenStreetMap centrado en Popayán.
 * Integra las celdas H3 hexagonales y renderiza iconos SVG de Lucide Icons.
 */
const HTML_OPENSTREETMAP_POPAYAN = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #e2e8f0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      background: rgba(255,255,255,0.85) !important;
    }
    .marcador-contenedor {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .badge-icono {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.22);
      border: 2.5px solid;
      transition: transform 0.15s ease;
    }
    .marcador-contenedor:hover .badge-icono {
      transform: scale(1.15);
    }
    .etiqueta-zona {
      margin-top: 3px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.12);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function generarIconoLucideSvg(tipo, color) {
      const stroke = color || '#334155';
      switch ((tipo || '').toUpperCase()) {
        case 'FELICIDAD':
          return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
        case 'NEUTRALIDAD':
          return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
        case 'PREOCUPACION':
          return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
        case 'ENFADO':
          return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
        case 'ANSIEDAD':
          return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>';
        case 'PROTEGIDA':
        default:
          return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      }
    }

    // Coordenadas reales de Popayán (Parque Caldas: 2.4419, -76.6063)
    const map = L.map('map', {
      center: [2.4434, -76.6056],
      zoom: 14,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false
    });

    // Proveedor gratuito OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const capaPoligonos = L.layerGroup().addTo(map);
    const capaMarcadores = L.layerGroup().addTo(map);

    map.on('zoomend', function() {
      const z = map.getZoom();
      window.parent.postMessage({ tipo: 'CAMBIO_ZOOM', zoom: z }, '*');
    });

    window.addEventListener('message', function(e) {
      if (!e.data) return;
      const msg = e.data;
      if (msg.tipo === 'CARGAR_CELDAS') {
        renderizarCeldas(msg.celdas, msg.idSeleccionada);
      } else if (msg.tipo === 'ZOOM_IN') {
        map.zoomIn();
      } else if (msg.tipo === 'ZOOM_OUT') {
        map.zoomOut();
      } else if (msg.tipo === 'CENTRAR') {
        map.setView([2.4434, -76.6056], 14);
      }
    });

    function renderizarCeldas(celdas, idSeleccionada) {
      capaPoligonos.clearLayers();
      capaMarcadores.clearLayers();
      if (!celdas || !celdas.length) return;

      celdas.forEach(function(celda) {
        const esSeleccionada = idSeleccionada === celda.idCeldaH3;
        const color = celda.codigoHexColor || '#94A3B8';

        if (celda.verticesHexagono && celda.verticesHexagono.length) {
          const vertices = celda.verticesHexagono.map(function(v) { return [v.latitud, v.longitud]; });
          const poli = L.polygon(vertices, {
            color: color,
            fillColor: color,
            fillOpacity: celda.cumpleUmbral ? (esSeleccionada ? 0.55 : 0.35) : 0.15,
            weight: esSeleccionada ? 4 : (celda.cumpleUmbral ? 2.5 : 1.5),
            dashArray: celda.cumpleUmbral ? null : '5, 5'
          });

          poli.on('click', function() {
            window.parent.postMessage({ tipo: 'SELECCIONAR_CELDA', celda: celda }, '*');
          });
          capaPoligonos.addLayer(poli);
        }

        const iconoTipo = celda.cumpleUmbral ? celda.emocionPredominante : 'PROTEGIDA';
        const svgIcono = generarIconoLucideSvg(iconoTipo, color);

        const htmlMarcador = '<div class="marcador-contenedor">' +
          '<div class="badge-icono" style="border-color: ' + color + '; ' + (esSeleccionada ? 'transform: scale(1.18); box-shadow: 0 0 0 3px #0284C7;' : '') + '">' +
            svgIcono +
          '</div>' +
          '<div class="etiqueta-zona">' + (celda.nombreZona || 'Zona') + '</div>' +
        '</div>';

        const icono = L.divIcon({
          className: 'marcador-div',
          html: htmlMarcador,
          iconSize: [90, 54],
          iconAnchor: [45, 27]
        });

        const marker = L.marker([celda.latitudCentroide, celda.longitudCentroide], { icon: icono });
        marker.on('click', function() {
          window.parent.postMessage({ tipo: 'SELECCIONAR_CELDA', celda: celda }, '*');
        });
        capaMarcadores.addLayer(marker);
      });
    }

    window.parent.postMessage({ tipo: 'MAPA_LISTO' }, '*');
  </script>
</body>
</html>`;

/**
 * Componente de Mapa Interactivo Colectivo de Popayán (HU-05).
 * Integra OpenStreetMap real, controles funcionales de zoom (+/-),
 * hexágonos H3 con el patrón Strategy y Lucide Icons.
 */
export const MapaInteractivoEmociones: React.FC<PropiedadesMapa> = ({ onSeleccionarZona }) => {
  const [zoom, setZoom] = useState<number>(14);
  const [cargando, setCargando] = useState<boolean>(true);
  const [datosMapa, setDatosMapa] = useState<ConsultaMapaEmocionalRespuesta | null>(null);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<CeldaMapaEmocional | null>(null);
  const [mostrarZonasReserva, setMostrarZonasReserva] = useState<boolean>(false);
  const [todasLasCeldas, setTodasLasCeldas] = useState<CeldaMapaEmocional[]>([]);
  const [modalProteccionVisible, setModalProteccionVisible] = useState<boolean>(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const mapaListoRef = useRef<boolean>(false);

  // Escuchar mensajes provenientes del mapa OpenStreetMap / Leaflet
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const manejarMensaje = (event: MessageEvent) => {
      if (!event.data) return;
      const data = event.data;

      if (data.tipo === 'MAPA_LISTO') {
        mapaListoRef.current = true;
        enviarCeldasAlMapa(
          mostrarZonasReserva ? todasLasCeldas : datosMapa?.celdasVisibles || [],
          celdaSeleccionada?.idCeldaH3
        );
      } else if (data.tipo === 'CAMBIO_ZOOM') {
        const nuevoZoom = data.zoom;
        if (typeof nuevoZoom === 'number' && nuevoZoom !== zoom) {
          setZoom(nuevoZoom);
        }
      } else if (data.tipo === 'SELECCIONAR_CELDA') {
        const celda = data.celda as CeldaMapaEmocional;
        setCeldaSeleccionada(celda);
        if (onSeleccionarZona) {
          onSeleccionarZona(celda);
        }
      }
    };

    window.addEventListener('message', manejarMensaje);
    return () => {
      window.removeEventListener('message', manejarMensaje);
    };
  }, [zoom, mostrarZonasReserva, datosMapa, todasLasCeldas, celdaSeleccionada]);

  // Cargar datos del backend al cambiar el zoom
  useEffect(() => {
    cargarDatosMapa(zoom);
  }, [zoom]);

  const cargarDatosMapa = async (nivelZoom: number) => {
    setCargando(true);
    try {
      const res = await consultarMapaPopayan(nivelZoom, 5);
      setDatosMapa(res);

      const todas = await consultarTodasLasCeldas(nivelZoom, 5);
      setTodasLasCeldas(todas);

      const lista = mostrarZonasReserva ? todas : res.celdasVisibles;
      enviarCeldasAlMapa(lista, celdaSeleccionada?.idCeldaH3);
    } catch (err) {
      console.error('Error cargando celdas del mapa:', err);
    } finally {
      setCargando(false);
    }
  };

  const enviarCeldasAlMapa = (celdas: CeldaMapaEmocional[], idSeleccionada?: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          tipo: 'CARGAR_CELDAS',
          celdas: celdas,
          idSeleccionada: idSeleccionada,
        },
        '*'
      );
    }
  };

  // Alternar zonas en reserva
  const toggleMostrarReserva = () => {
    const nuevoEstado = !mostrarZonasReserva;
    setMostrarZonasReserva(nuevoEstado);
    const lista = nuevoEstado ? todasLasCeldas : datosMapa?.celdasVisibles || [];
    enviarCeldasAlMapa(lista, celdaSeleccionada?.idCeldaH3);
  };

  // Acciones de Zoom
  const handleZoomIn = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'ZOOM_IN' }, '*');
    }
  };

  const handleZoomOut = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'ZOOM_OUT' }, '*');
    }
  };

  const handleCentrarPopayan = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'CENTRAR' }, '*');
    }
  };

  const obtenerEtiquetaResolucion = (res: number) => {
    if (res >= 9) return 'Barrial (Res 9)';
    if (res === 8) return 'Sector (Res 8)';
    return 'Ciudad (Res 7)';
  };

  return (
    <View style={estilos.contenedor}>
      {/* Barra superior con indicador en tiempo real y selector de resolución */}
      <View style={estilos.barraSuperior}>
        <View style={estilos.badgeTiempoReal}>
          <Radio size={14} color="#EF4444" strokeWidth={2.5} />
          <Text style={estilos.textoTiempoReal}>En tiempo real</Text>
        </View>

        <View style={estilos.chipResolucion}>
          <Text style={estilos.textoResolucion}>
            Zoom {zoom} • {obtenerEtiquetaResolucion(datosMapa?.resolucionH3Utilizada || 9)}
          </Text>
        </View>

        <TouchableOpacity
          style={estilos.botonRecargar}
          onPress={() => cargarDatosMapa(zoom)}
          activeOpacity={0.7}
          accessibilityLabel="Recargar mapa"
        >
          <RotateCcw size={15} color="#334155" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Contenedor del Mapa OpenStreetMap de Popayán */}
      <View style={estilos.lienzoMapa}>
        {Platform.OS === 'web' ? (
          // @ts-ignore
          <iframe
            ref={iframeRef}
            srcDoc={HTML_OPENSTREETMAP_POPAYAN}
            style={estilos.iframeMapa}
            title="Mapa de Popayán OpenStreetMap"
          />
        ) : (
          <View style={estilos.avisoMovil}>
            <Text style={estilos.textoCarga}>Cargando mapa interactivo...</Text>
          </View>
        )}

        {/* Indicador de carga flotante */}
        {cargando && (
          <View style={estilos.overlayCarga}>
            <ActivityIndicator size="small" color="#0284C7" />
            <Text style={estilos.textoCarga}>Actualizando capa emocional...</Text>
          </View>
        )}

        {/* Controles flotantes de Zoom funcionales (+ / -) */}
        <View style={estilos.controlesZoom}>
          <TouchableOpacity
            style={estilos.botonZoom}
            onPress={handleZoomIn}
            activeOpacity={0.7}
            accessibilityLabel="Acercar mapa"
          >
            <ZoomIn size={18} color="#334155" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={estilos.separadorZoom} />
          <TouchableOpacity
            style={estilos.botonZoom}
            onPress={handleZoomOut}
            activeOpacity={0.7}
            accessibilityLabel="Alejar mapa"
          >
            <ZoomOut size={18} color="#334155" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Botón flotante para alternar visualización de zonas en reserva */}
        <TouchableOpacity
          style={[
            estilos.botonToggleReserva,
            mostrarZonasReserva && estilos.botonToggleReservaActivo,
          ]}
          onPress={toggleMostrarReserva}
          activeOpacity={0.8}
        >
          {mostrarZonasReserva ? (
            <Lock size={14} color="#B45309" strokeWidth={2.2} />
          ) : (
            <Eye size={14} color="#334155" strokeWidth={2.2} />
          )}
          <Text
            style={[
              estilos.textoBotonReserva,
              mostrarZonasReserva && estilos.textoBotonReservaActivo,
            ]}
          >
            {mostrarZonasReserva ? 'Mostrando reservas' : 'Ver zonas en reserva'}
          </Text>
        </TouchableOpacity>

        {/* Leyenda de Emociones Flotante */}
        <View style={estilos.contenedorLeyenda}>
          <LeyendaEmociones
            onPresionarInfo={() => setModalProteccionVisible(true)}
          />
        </View>
      </View>

      {/* Tarjeta inferior con el Detalle de la Celda Seleccionada */}
      {celdaSeleccionada && (
        <View style={estilos.tarjetaDetalle}>
          <View style={estilos.cabeceraDetalle}>
            <View style={estilos.filaTituloDetalle}>
              <View
                style={[
                  estilos.circuloIconoDetalle,
                  {
                    backgroundColor: celdaSeleccionada.codigoHexFondo,
                    borderColor: celdaSeleccionada.codigoHexColor,
                  },
                ]}
              >
                <IconoEmocion
                  emocion={celdaSeleccionada.emocionPredominante || 'PROTEGIDA'}
                  color={celdaSeleccionada.codigoHexColor}
                  size={24}
                />
              </View>
              <View>
                <Text style={estilos.nombreZonaDetalle}>
                  {celdaSeleccionada.nombreZona}
                </Text>
                <Text
                  style={[
                    estilos.emocionDetalle,
                    { color: celdaSeleccionada.codigoHexColor },
                  ]}
                >
                  {celdaSeleccionada.nombreEmocion} Predominante
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setCeldaSeleccionada(null);
                enviarCeldasAlMapa(
                  mostrarZonasReserva ? todasLasCeldas : datosMapa?.celdasVisibles || [],
                  undefined
                );
              }}
              style={estilos.botonCerrarDetalle}
            >
              <X size={18} color="#64748B" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <View style={estilos.cajaProteccionDetalle}>
            <Shield size={16} color="#166534" strokeWidth={2.2} />
            <Text style={estilos.textoProteccionDetalle}>
              {celdaSeleccionada.descripcionProteccion}
            </Text>
          </View>

          <TouchableOpacity
            style={estilos.botonVerDetalleCompleto}
            onPress={() => setModalDetalleVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Ver desglose y balance emocional de la zona"
          >
            <BarChart2 size={16} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={estilos.textoBotonVerDetalle}>
              Ver desglose y tendencia
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal accesible de Protección en Comunidad para ciudadanos */}
      <Modal
        visible={modalProteccionVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalProteccionVisible(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <View style={estilos.modalCabecera}>
              <Shield size={26} color="#0284C7" strokeWidth={2.2} />
              <Text style={estilos.modalTitulo}>Protección en Comunidad</Text>
            </View>

            <ScrollView style={estilos.modalScroll}>
              <Text style={estilos.modalParrafo}>
                En Almara cuidamos la privacidad y la tranquilidad de cada ciudadano.
              </Text>

              <View style={estilos.modalCajaDestacada}>
                <Text style={estilos.modalSubtitulo}>¿Cómo cuidamos tu privacidad?</Text>
                <Text style={estilos.modalTextoDestacado}>
                  • Solo coloreamos una zona cuando al menos 5 vecinos han compartido cómo se sienten en ese lugar.
                </Text>
                <Text style={estilos.modalTextoDestacado}>
                  • Si aún hay pocas opiniones, la zona se mantiene neutra o en reserva para que nadie pueda adivinar qué siente una persona en particular.
                </Text>
                <Text style={estilos.modalTextoDestacado}>
                  • Tu ubicación exacta y tus datos personales jamás se guardan ni se muestran. Solo se suma el sentir colectivo.
                </Text>
              </View>

              <Text style={estilos.modalParrafoSecundario}>
                Así puedes expresar libremente tus emociones sabiendo que siempre estás protegido por tu comunidad.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={estilos.botonEntendido}
              onPress={() => setModalProteccionVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotonEntendido}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal accesible de Detalle Emocional de Zona (HU-06) */}
      <ModalDetalleZona
        visible={modalDetalleVisible}
        idCeldaH3={celdaSeleccionada?.idCeldaH3 || null}
        nombreZonaInicial={celdaSeleccionada?.nombreZona}
        onCerrar={() => setModalDetalleVisible(false)}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  barraSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  badgeTiempoReal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 6,
  },
  textoTiempoReal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  chipResolucion: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoResolucion: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  botonRecargar: {
    padding: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lienzoMapa: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  iframeMapa: {
    width: '100%',
    height: '100%',
    border: 'none',
  } as any,
  avisoMovil: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCarga: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: [{ translateX: -100 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 30,
  },
  textoCarga: {
    fontSize: 11.5,
    color: '#0369A1',
    fontWeight: '600',
  },
  controlesZoom: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  botonZoom: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separadorZoom: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  botonToggleReserva: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
    zIndex: 20,
  },
  botonToggleReservaActivo: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  textoBotonReserva: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  textoBotonReservaActivo: {
    color: '#92400E',
  },
  contenedorLeyenda: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  tarjetaDetalle: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  cabeceraDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filaTituloDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circuloIconoDetalle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombreZonaDetalle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emocionDetalle: {
    fontSize: 13,
    fontWeight: '600',
  },
  botonCerrarDetalle: {
    padding: 6,
  },
  cajaProteccionDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 8,
  },
  textoProteccionDetalle: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
  botonVerDetalleCompleto: {
    marginTop: 10,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoBotonVerDetalle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    maxWidth: 420,
    width: '100%',
    maxHeight: '80%',
  },
  modalCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalScroll: {
    marginVertical: 8,
  },
  modalParrafo: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalCajaDestacada: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 12,
  },
  modalSubtitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  modalTextoDestacado: {
    fontSize: 12.5,
    color: '#1E40AF',
    lineHeight: 18,
    marginBottom: 6,
  },
  modalParrafoSecundario: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  botonEntendido: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  textoBotonEntendido: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
