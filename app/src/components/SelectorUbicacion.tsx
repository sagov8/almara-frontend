import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  MapPin,
  Navigation,
  ChevronDown,
  Info,
  X,
  Check,
  Search,
  Shield,
  RotateCcw,
} from 'lucide-react-native';
import { ElementoCatalogoZona } from '../services/servicioEmocion';

export type ModoUbicacion = 'GPS' | 'MANUAL';

export interface EstadoUbicacion {
  modo: ModoUbicacion;
  latitud?: number;
  longitud?: number;
  zonaManualId?: string;
  nombreZona?: string;
}

interface PropsSelectorUbicacion {
  zonasDisponibles: ElementoCatalogoZona[];
  ubicacionActual: EstadoUbicacion;
  alCambiarUbicacion: (nueva: EstadoUbicacion) => void;
  deshabilitado?: boolean;
}

/**
 * Componente compacto para la selección de ubicación del reporte (HU-04).
 * Ocupa un espacio mínimo en pantalla para dar protagonismo a las emociones:
 * - Si el GPS está activo: Muestra una pastilla delgada con estado GPS.
 * - Si es manual: Muestra un select compacto que abre un modal con la lista de zonas.
 * - Advertencia de privacidad accesible mediante un botón de información (Info) al hover o clic.
 */
export const SelectorUbicacion: React.FC<PropsSelectorUbicacion> = ({
  zonasDisponibles,
  ubicacionActual,
  alCambiarUbicacion,
  deshabilitado = false,
}) => {
  const [modalZonasVisible, setModalZonasVisible] = useState<boolean>(false);
  const [modalPrivacidadVisible, setModalPrivacidadVisible] = useState<boolean>(false);
  const [mostrarTooltip, setMostrarTooltip] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState<string>('');
  const [estaSolicitandoGps, setEstaSolicitandoGps] = useState<boolean>(false);
  const [mensajeErrorGps, setMensajeErrorGps] = useState<string | null>(null);

  // Intentar solicitar permiso GPS automáticamente al cargar para mostrar el indicador si el usuario lo permite
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation && ubicacionActual.modo !== 'GPS') {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          alCambiarUbicacion({
            modo: 'GPS',
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            nombreZona: 'Ubicación GPS actual',
          });
        },
        () => {
          // Si el usuario deniega o cancela permisos, se conserva silenciosamente la zona predeterminada
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  const solicitarGps = () => {
    if (deshabilitado) return;
    setEstaSolicitandoGps(true);
    setMensajeErrorGps(null);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          setEstaSolicitandoGps(false);
          setModalZonasVisible(false);
          alCambiarUbicacion({
            modo: 'GPS',
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            nombreZona: 'Ubicación GPS actual',
          });
        },
        (error) => {
          setEstaSolicitandoGps(false);
          let mensaje = 'No se pudo obtener la señal GPS.';
          if (error.code === 1) {
            mensaje = 'Permiso GPS denegado. Por favor elige un sector de la lista.';
          } else if (error.code === 2) {
            mensaje = 'Señal GPS no disponible.';
          } else if (error.code === 3) {
            mensaje = 'Tiempo de espera GPS agotado.';
          }
          setMensajeErrorGps(mensaje);

          if (zonasDisponibles.length > 0 && ubicacionActual.modo !== 'MANUAL') {
            const zonaDefecto = zonasDisponibles[0];
            alCambiarUbicacion({
              modo: 'MANUAL',
              zonaManualId: zonaDefecto.zonaManualId,
              nombreZona: zonaDefecto.nombre,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setEstaSolicitandoGps(false);
      setMensajeErrorGps('Geolocalización no soportada en este dispositivo.');
    }
  };

  const seleccionarZonaManual = (zona: ElementoCatalogoZona) => {
    if (deshabilitado) return;
    setMensajeErrorGps(null);
    alCambiarUbicacion({
      modo: 'MANUAL',
      zonaManualId: zona.zonaManualId,
      nombreZona: zona.nombre,
    });
    setModalZonasVisible(false);
  };

  const zonasFiltradas = zonasDisponibles.filter((z) =>
    z.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (z.descripcion && z.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const esModoGps = ubicacionActual.modo === 'GPS';

  return (
    <View style={estilos.contenedorCompacto}>
      {/* Barra principal compacta de una sola línea */}
      <View style={estilos.barraFila}>
        {/* Selector de zona o indicador GPS */}
        <TouchableOpacity
          style={[
            estilos.botonSelectorPrincipal,
            esModoGps && estilos.botonSelectorGps,
            deshabilitado && estilos.deshabilitado,
          ]}
          onPress={() => !deshabilitado && setModalZonasVisible(true)}
          activeOpacity={0.7}
          disabled={deshabilitado}
          accessibilityLabel="Cambiar ubicación del reporte"
        >
          {esModoGps ? (
            <View style={estilos.filaIndicador}>
              <Navigation size={16} color="#059669" strokeWidth={2.5} />
              <Text style={estilos.textoGpsActivo} numberOfLines={1}>
                GPS Activo • {ubicacionActual.nombreZona || 'Popayán'}
              </Text>
              <Text style={estilos.textoEnlaceCambiar}>Cambiar</Text>
            </View>
          ) : (
            <View style={estilos.filaIndicador}>
              <MapPin size={16} color="#0284C7" strokeWidth={2.2} />
              <Text style={estilos.textoEtiquetaZona}>Sector:</Text>
              <Text style={estilos.textoNombreZona} numberOfLines={1}>
                {ubicacionActual.nombreZona || 'Seleccionar sector...'}
              </Text>
              <ChevronDown size={16} color="#64748B" strokeWidth={2} />
            </View>
          )}
        </TouchableOpacity>

        {/* Botón de Información de Privacidad accesible con soporte de hover y clic */}
        <View style={estilos.contenedorInfoRelativo}>
          <TouchableOpacity
            style={estilos.botonInfoPrivacidad}
            onPress={() => setModalPrivacidadVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Aviso de privacidad de ubicación"
            accessibilityHint="Ver aviso de privacidad"
            {...(Platform.OS === 'web'
              ? ({
                  title: 'Ver aviso de privacidad',
                  onMouseEnter: () => setMostrarTooltip(true),
                  onMouseLeave: () => setMostrarTooltip(false),
                } as any)
              : {})}
          >
            <Info size={17} color="#475569" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Tooltip flotante emergente al pasar el cursor (hover en web) */}
          {mostrarTooltip && (
            <View style={estilos.tooltipFlotante} pointerEvents="none">
              <Text style={estilos.textoTooltip}>
                <Text style={estilos.textoTooltipResaltado}>Protección total: </Text>
                Tu GPS exacto nunca se almacena ni se asocia a ti. Se usa solo para agrupar la celda anónima en Popayán. Clic para ver más.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Aviso sutil si hubo error al solicitar GPS */}
      {mensajeErrorGps && (
        <View style={estilos.avisoError}>
          <Text style={estilos.textoAvisoError}>{mensajeErrorGps}</Text>
        </View>
      )}

      {/* Modal Dropdown para Selección de Zona en Popayán */}
      <Modal
        visible={modalZonasVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalZonasVisible(false)}
      >
        <View style={estilos.overlayModal}>
          <View style={estilos.tarjetaModalZonas}>
            {/* Cabecera del Modal */}
            <View style={estilos.cabeceraModal}>
              <View style={estilos.tituloModalConIcono}>
                <MapPin size={20} color="#0284C7" strokeWidth={2.2} />
                <Text style={estilos.tituloModal}>Ubicación en Popayán</Text>
              </View>
              <TouchableOpacity
                style={estilos.botonCerrarModal}
                onPress={() => setModalZonasVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Opción para usar GPS actual */}
            <TouchableOpacity
              style={[
                estilos.opcionGpsModal,
                esModoGps && estilos.opcionGpsModalActiva,
              ]}
              onPress={solicitarGps}
              disabled={estaSolicitandoGps}
              activeOpacity={0.8}
            >
              {estaSolicitandoGps ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Navigation size={18} color="#059669" strokeWidth={2.2} />
              )}
              <View style={estilos.textosOpcionGps}>
                <Text style={estilos.tituloOpcionGps}>
                  {estaSolicitandoGps ? 'Obteniendo GPS...' : 'Usar mi ubicación GPS actual'}
                </Text>
                <Text style={estilos.subtituloOpcionGps}>
                  Detecta automáticamente tu sector en Popayán
                </Text>
              </View>
              {esModoGps && <Check size={18} color="#059669" strokeWidth={2.5} />}
            </TouchableOpacity>

            {/* Buscador de sectores */}
            <View style={estilos.cajaBuscador}>
              <Search size={16} color="#94A3B8" strokeWidth={2} />
              <TextInput
                style={estilos.inputBuscador}
                placeholder="Buscar sector o barrio..."
                placeholderTextColor="#94A3B8"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCorrect={false}
              />
              {busqueda.length > 0 && (
                <TouchableOpacity onPress={() => setBusqueda('')}>
                  <X size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Lista desplegable de sectores */}
            <ScrollView
              style={estilos.listaSectores}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={estilos.encabezadoLista}>Sectores predeterminados ({zonasFiltradas.length})</Text>

              {zonasFiltradas.length === 0 ? (
                <View style={estilos.vacioContainer}>
                  <Text style={estilos.textoVacio}>No se encontraron sectores con ese nombre.</Text>
                </View>
              ) : (
                zonasFiltradas.map((zona) => {
                  const esSeleccionada =
                    !esModoGps && ubicacionActual.zonaManualId === zona.zonaManualId;
                  return (
                    <TouchableOpacity
                      key={zona.zonaManualId}
                      style={[
                        estilos.itemZona,
                        esSeleccionada && estilos.itemZonaSeleccionada,
                      ]}
                      onPress={() => seleccionarZonaManual(zona)}
                      activeOpacity={0.7}
                    >
                      <View style={estilos.iconoZonaPunto}>
                        <MapPin
                          size={15}
                          color={esSeleccionada ? '#0284C7' : '#94A3B8'}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={estilos.textosZona}>
                        <Text
                          style={[
                            estilos.nombreZonaItem,
                            esSeleccionada && estilos.nombreZonaItemSeleccionada,
                          ]}
                        >
                          {zona.nombre}
                        </Text>
                        {zona.descripcion ? (
                          <Text style={estilos.descripcionZonaItem} numberOfLines={2}>
                            {zona.descripcion}
                          </Text>
                        ) : null}
                      </View>
                      {esSeleccionada && (
                        <Check size={18} color="#0284C7" strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal / Diálogo de Advertencia de Privacidad */}
      <Modal
        visible={modalPrivacidadVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalPrivacidadVisible(false)}
      >
        <View style={estilos.overlayModal}>
          <View style={estilos.tarjetaPrivacidadModal}>
            <View style={estilos.iconoEscudoGrande}>
              <Shield size={32} color="#15803D" strokeWidth={2.2} />
            </View>
            <Text style={estilos.tituloPrivacidadModal}>Protección en Comunidad</Text>
            <Text style={estilos.textoPrivacidadModal}>
              Tus coordenadas GPS exactas <Text style={estilos.negrita}>nunca se almacenan ni se asocian a ti</Text>.
            </Text>
            <Text style={estilos.textoPrivacidadSecundario}>
              Al registrar tu emoción, tu ubicación se convierte de inmediato en una celda espacial anónima de Popayán para que nadie pueda rastrear tus movimientos individuales.
            </Text>

            <TouchableOpacity
              style={estilos.botonEntendidoPrivacidad}
              onPress={() => setModalPrivacidadVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotonEntendido}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorCompacto: {
    marginBottom: 16,
  },
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonSelectorPrincipal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  botonSelectorGps: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  filaIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  textoGpsActivo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  textoEnlaceCambiar: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
  textoEtiquetaZona: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  textoNombreZona: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  contenedorInfoRelativo: {
    position: 'relative',
    zIndex: 30,
  },
  botonInfoPrivacidad: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tooltipFlotante: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 260,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  textoTooltip: {
    fontSize: 11.5,
    color: '#F1F5F9',
    lineHeight: 16,
  },
  textoTooltipResaltado: {
    fontWeight: '700',
    color: '#4ADE80',
  },
  avisoError: {
    marginTop: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  textoAvisoError: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '500',
  },
  deshabilitado: {
    opacity: 0.6,
  },
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tarjetaModalZonas: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  cabeceraModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tituloModalConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tituloModal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  botonCerrarModal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcionGpsModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  opcionGpsModalActiva: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  textosOpcionGps: {
    flex: 1,
  },
  tituloOpcionGps: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#166534',
  },
  subtituloOpcionGps: {
    fontSize: 11.5,
    color: '#15803D',
    marginTop: 1,
  },
  cajaBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  inputBuscador: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  listaSectores: {
    maxHeight: 340,
  },
  encabezadoLista: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemZona: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 10,
  },
  itemZonaSeleccionada: {
    backgroundColor: '#EFF6FF',
  },
  iconoZonaPunto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textosZona: {
    flex: 1,
  },
  nombreZonaItem: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  nombreZonaItemSeleccionada: {
    color: '#0284C7',
    fontWeight: '800',
  },
  descripcionZonaItem: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  vacioContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 13,
    color: '#94A3B8',
  },
  tarjetaPrivacidadModal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  iconoEscudoGrande: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  tituloPrivacidadModal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  textoPrivacidadModal: {
    fontSize: 13.5,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 8,
  },
  textoPrivacidadSecundario: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  negrita: {
    fontWeight: '700',
    color: '#0F172A',
  },
  botonEntendidoPrivacidad: {
    backgroundColor: '#0F172A',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  textoBotonEntendido: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
