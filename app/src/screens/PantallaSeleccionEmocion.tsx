import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TarjetaEmocion } from '../components/TarjetaEmocion';
import { DefinicionEmocion, LISTA_EMOCIONES } from '../constants/emociones';
import {
  enviarSeleccionEmocion,
  ErrorRegistroEmocion,
  RespuestaRegistroEmocion,
} from '../services/servicioEmocion';

export const PantallaSeleccionEmocion: React.FC = () => {
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<DefinicionEmocion | null>(null);
  const [estaEnviando, setEstaEnviando] = useState<boolean>(false);
  const [respuestaExitosa, setRespuestaExitosa] = useState<RespuestaRegistroEmocion | null>(null);
  const [segundosBloqueoRestantes, setSegundosBloqueoRestantes] = useState<number>(0);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState<boolean>(false);

  // Contador regresivo para el período de bloqueo (cooldown)
  useEffect(() => {
    if (segundosBloqueoRestantes <= 0) return;

    const intervalo = setInterval(() => {
      setSegundosBloqueoRestantes((previo) => {
        if (previo <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return previo - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [segundosBloqueoRestantes]);

  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
  };

  /**
   * Maneja el toque en una tarjeta de emoción (máximo 2 toques: seleccionar y confirmar).
   */
  const manejarSeleccionEmocion = async (emocion: DefinicionEmocion) => {
    if (segundosBloqueoRestantes > 0) {
      Alert.alert(
        'Período de Espera Activo',
        `Ya registraste tu emoción. Podrás enviar un nuevo reporte en ${formatearTiempo(
          segundosBloqueoRestantes
        )} minutos.`
      );
      return;
    }

    setEmocionSeleccionada(emocion);

    // Segundo toque automático o inmediato para registrar en menos de 2 toques
    try {
      setEstaEnviando(true);
      const respuesta = await enviarSeleccionEmocion(emocion.id);
      setRespuestaExitosa(respuesta);
      setSegundosBloqueoRestantes(respuesta.segundosBloqueo || 900);
      setMostrarModalConfirmacion(true);
    } catch (errorCapturado: any) {
      const error = errorCapturado as ErrorRegistroEmocion;
      if (error.codigoEstado === 429 && error.segundosRestantes) {
        setSegundosBloqueoRestantes(error.segundosRestantes);
        Alert.alert(
          'Límite de Frecuencia',
          `Debes esperar ${formatearTiempo(error.segundosRestantes)} antes de registrar otra emoción.`
        );
      } else {
        Alert.alert(
          'Aviso',
          error.mensaje || 'No se pudo conectar con el servidor. Se guardará tu preferencia localmente.'
        );
      }
    } finally {
      setEstaEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.contenedorPrincipal}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Barra superior estilo Almara (Mockup) */}
      <View style={estilos.barraSuperior}>
        <Text style={estilos.logotipo}>Almara</Text>
        <View style={estilos.contenedorIconosAccion}>
          <TouchableOpacity
            style={estilos.botonIcono}
            accessibilityLabel="Notificaciones"
          >
            <Text style={estilos.simboloIcono}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.botonIcono}
            accessibilityLabel="Perfil de usuario"
          >
            <Text style={estilos.simboloIcono}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={estilos.contenidoScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera de la pantalla */}
        <View style={estilos.encabezado}>
          <Text style={estilos.tituloPrincipal}>Registrar Emoción</Text>
          <Text style={estilos.subtitulo}>
            ¿Cómo te sientes en este momento y lugar?
          </Text>
        </View>

        {/* Indicador de bloqueo temporal si está activo */}
        {segundosBloqueoRestantes > 0 && (
          <View style={estilos.bannerBloqueo}>
            <Text style={estilos.textoBannerBloqueo}>
              ⏱️ Próximo reporte disponible en:{' '}
              <Text style={estilos.tiempoResaltado}>
                {formatearTiempo(segundosBloqueoRestantes)}
              </Text>
            </Text>
          </View>
        )}

        {/* Grilla de Emociones (2 columnas como en el Mockup) */}
        <View style={estilos.grillaEmociones}>
          {LISTA_EMOCIONES.map((emocion) => (
            <View key={emocion.id} style={estilos.columnaGrilla}>
              <TarjetaEmocion
                emocion={emocion}
                seleccionada={emocionSeleccionada?.id === emocion.id}
                alSeleccionar={manejarSeleccionEmocion}
                deshabilitada={estaEnviando || segundosBloqueoRestantes > 0}
              />
            </View>
          ))}
          {/* Elemento vacío para balancear la última fila de 1 elemento */}
          <View style={estilos.columnaGrilla} />
        </View>

        {estaEnviando && (
          <View style={estilos.contenedorCarga}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={estilos.textoCarga}>Registrando tu emoción...</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Confirmación Exitosa (Criterio 5) */}
      <Modal
        visible={mostrarModalConfirmacion}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModalConfirmacion(false)}
      >
        <View style={estilos.fondoModal}>
          <View style={estilos.tarjetaModal}>
            <View
              style={[
                estilos.iconoExitoCirculo,
                { backgroundColor: emocionSeleccionada?.colorFondoCirculo || '#D1FAE5' },
              ]}
            >
              <Text style={estilos.iconoExitoTexto}>
                {emocionSeleccionada?.simboloFacial || '✓'}
              </Text>
            </View>

            <Text style={estilos.tituloModal}>¡Emoción Registrada!</Text>
            <Text style={estilos.mensajeModal}>
              Has seleccionado{' '}
              <Text
                style={{
                  color: emocionSeleccionada?.colorPrincipal || '#10B981',
                  fontWeight: '700',
                }}
              >
                {emocionSeleccionada?.etiqueta}
              </Text>
              . Tu reporte anónimo ha sido sumado al mapa colectivo de la ciudad.
            </Text>

            <TouchableOpacity
              style={estilos.botonCerrarModal}
              onPress={() => setMostrarModalConfirmacion(false)}
            >
              <Text style={estilos.textoBotonModal}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  barraSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logotipo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  contenedorIconosAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botonIcono: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  simboloIcono: {
    fontSize: 18,
  },
  contenidoScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  encabezado: {
    alignItems: 'center',
    marginVertical: 24,
  },
  tituloPrincipal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bannerBloqueo: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  textoBannerBloqueo: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
  tiempoResaltado: {
    fontWeight: '700',
  },
  grillaEmociones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  columnaGrilla: {
    width: '50%',
  },
  contenedorCarga: {
    marginTop: 20,
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconoExitoCirculo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconoExitoTexto: {
    fontSize: 36,
  },
  tituloModal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  mensajeModal: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  botonCerrarModal: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  textoBotonModal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
