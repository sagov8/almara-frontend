import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

export const SelectorUbicacion: React.FC<PropsSelectorUbicacion> = ({
  zonasDisponibles,
  ubicacionActual,
  alCambiarUbicacion,
  deshabilitado = false,
}) => {
  const [estaSolicitandoGps, setEstaSolicitandoGps] = useState<boolean>(false);
  const [mensajeErrorGps, setMensajeErrorGps] = useState<string | null>(null);

  const solicitarGps = () => {
    if (deshabilitado) return;
    setEstaSolicitandoGps(true);
    setMensajeErrorGps(null);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          setEstaSolicitandoGps(false);
          alCambiarUbicacion({
            modo: 'GPS',
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            nombreZona: 'Ubicación GPS actual',
          });
        },
        (error) => {
          setEstaSolicitandoGps(false);
          let mensaje = 'No se pudo obtener la ubicación GPS.';
          if (error.code === 1) {
            mensaje = 'Permiso GPS denegado. Selecciona una zona manual.';
          } else if (error.code === 2) {
            mensaje = 'Señal GPS no disponible. Selecciona una zona manual.';
          } else if (error.code === 3) {
            mensaje = 'Tiempo de espera GPS agotado. Selecciona una zona manual.';
          }
          setMensajeErrorGps(mensaje);

          // Si falla, seleccionar la primera zona manual disponible
          if (zonasDisponibles.length > 0) {
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
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      {/* Título de sección */}
      <View style={estilos.encabezadoSeccion}>
        <Text style={estilos.tituloSeccion}>📍 Ubicación del Reporte (HU-04)</Text>
        <Text style={estilos.subtituloSeccion}>
          Elige si deseas usar tu GPS o seleccionar tu sector del catálogo oficial:
        </Text>
      </View>

      {/* Banner de Privacidad por Diseño */}
      <View style={estilos.bannerPrivacidad}>
        <Text style={estilos.textoBannerPrivacidad}>
          🛡️ <Text style={estilos.negrita}>Aviso de privacidad:</Text> Tus coordenadas GPS exactas nunca se
          almacenan ni se asocian a ti. Se transforman para compartirse de manera anónima.
        </Text>
      </View>

      {/* Botones de selección de modo: GPS vs Manual */}
      <View style={estilos.filaModos}>
        <TouchableOpacity
          style={[
            estilos.botonModo,
            ubicacionActual.modo === 'GPS' && estilos.botonModoActivo,
            deshabilitado && estilos.botonDeshabilitado,
          ]}
          onPress={solicitarGps}
          disabled={deshabilitado || estaSolicitandoGps}
          activeOpacity={0.7}
        >
          {estaSolicitandoGps ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Text
              style={[
                estilos.textoBotonModo,
                ubicacionActual.modo === 'GPS' && estilos.textoBotonModoActivo,
              ]}
            >
              🎯 Usar GPS Actual
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            estilos.botonModo,
            ubicacionActual.modo === 'MANUAL' && estilos.botonModoActivo,
            deshabilitado && estilos.botonDeshabilitado,
          ]}
          onPress={() => {
            if (zonasDisponibles.length > 0 && ubicacionActual.modo !== 'MANUAL') {
              const zonaDefecto = zonasDisponibles[0];
              seleccionarZonaManual(zonaDefecto);
            }
          }}
          disabled={deshabilitado}
          activeOpacity={0.7}
        >
          <Text
            style={[
              estilos.textoBotonModo,
              ubicacionActual.modo === 'MANUAL' && estilos.textoBotonModoActivo,
            ]}
          >
            🏛️ Catálogo de Zonas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mensaje de alerta GPS si existió error */}
      {mensajeErrorGps && (
        <View style={estilos.bannerAvisoError}>
          <Text style={estilos.textoAvisoError}>⚠️ {mensajeErrorGps}</Text>
        </View>
      )}

      {/* Resumen del estado actual seleccionado */}
      <View style={estilos.resumenSeleccion}>
        <View style={estilos.contenidoResumen}>
          <View style={estilos.filaResumen}>
            <Text style={estilos.etiquetaResumen}>Estado de ubicación:</Text>
            <Text style={estilos.valorResumen}>
              {ubicacionActual.modo === 'GPS'
                ? `📍 GPS Activo (${ubicacionActual.latitud?.toFixed(4)}, ${ubicacionActual.longitud?.toFixed(4)})`
                : `🏛️ ${ubicacionActual.nombreZona || 'Zona Manual Seleccionada'}`}
            </Text>
          </View>
          {ubicacionActual.modo === 'MANUAL' && (
            (() => {
              const zonaSel = zonasDisponibles.find((z) => z.zonaManualId === ubicacionActual.zonaManualId);
              return zonaSel?.descripcion ? (
                <Text style={estilos.descripcionZonaResumen}>
                  {zonaSel.descripcion}
                </Text>
              ) : null;
            })()
          )}
        </View>
      </View>

      {/* Si el modo es MANUAL, mostramos las zonas del catálogo oficial de la BD */}
      {ubicacionActual.modo === 'MANUAL' && (
        <View style={estilos.contenedorCatalogoZonas}>
          <Text style={estilos.subtituloCatalogo}>
            Selecciona tu sector en Popayán (Catálogo Base de Datos):
          </Text>
          <View style={estilos.grillaZonas}>
            {zonasDisponibles.map((zona) => {
              const esSeleccionada = ubicacionActual.zonaManualId === zona.zonaManualId;
              return (
                <TouchableOpacity
                  key={zona.zonaManualId}
                  style={[
                    estilos.chipZona,
                    esSeleccionada && estilos.chipZonaSeleccionada,
                    deshabilitado && estilos.botonDeshabilitado,
                  ]}
                  onPress={() => seleccionarZonaManual(zona)}
                  disabled={deshabilitado}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      estilos.textoChipZona,
                      esSeleccionada && estilos.textoChipZonaSeleccionada,
                    ]}
                  >
                    {zona.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorPrincipal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  encabezadoSeccion: {
    marginBottom: 8,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtituloSeccion: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  bannerPrivacidad: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  textoBannerPrivacidad: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  negrita: {
    fontWeight: '700',
  },
  filaModos: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  botonModo: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonModoActivo: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  textoBotonModo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  textoBotonModoActivo: {
    color: '#065F46',
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  bannerAvisoError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  textoAvisoError: {
    fontSize: 12,
    color: '#991B1B',
  },
  resumenSeleccion: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  contenidoResumen: {
    width: '100%',
  },
  filaResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiquetaResumen: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  valorResumen: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  descripcionZonaResumen: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  contenedorCatalogoZonas: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtituloCatalogo: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '600',
  },
  grillaZonas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipZona: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipZonaSeleccionada: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  textoChipZona: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  textoChipZonaSeleccionada: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
