import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TarjetaEmocion } from '../components/TarjetaEmocion';
import { SelectorIntensidad } from '../components/SelectorIntensidad';
import { SelectorUbicacion, EstadoUbicacion } from '../components/SelectorUbicacion';
import { SelectorComentario } from '../components/SelectorComentario';
import { DefinicionEmocion, LISTA_EMOCIONES } from '../constants/emociones';
import {
  ESCALA_INTENSIDAD,
  INTENSIDAD_PREDETERMINADA,
  obtenerEtiquetaIntensidad,
} from '../constants/intensidades';
import {
  ElementoCatalogoZona,
  LISTA_ZONAS_PREDETERMINADAS,
  enviarRegistroComentario,
  enviarRegistroIntensidad,
  enviarSeleccionEmocion,
  obtenerCatalogoEmociones,
  obtenerCatalogoZonas,
  ErrorRegistroEmocion,
  RespuestaRegistroComentario,
  RespuestaRegistroEmocion,
  RespuestaRegistroIntensidad,
} from '../services/servicioEmocion';

import { BarraNavegacionInferior, PestañaNavegacion } from '../components/BarraNavegacionInferior';
import { reiniciarTokenSesion } from '../services/servicioSesion';

interface PropiedadesPantallaSeleccionEmocion {
  alNavegar?: (pestaña: PestañaNavegacion) => void;
}

export const PantallaSeleccionEmocion: React.FC<PropiedadesPantallaSeleccionEmocion> = ({ alNavegar }) => {
  const [catalogoEmociones, setCatalogoEmociones] = useState<DefinicionEmocion[]>(LISTA_EMOCIONES);
  const [catalogoZonas, setCatalogoZonas] = useState<ElementoCatalogoZona[]>(LISTA_ZONAS_PREDETERMINADAS);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(true);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<DefinicionEmocion | null>(null);
  const [nivelIntensidad, setNivelIntensidad] = useState<number>(INTENSIDAD_PREDETERMINADA);
  const [comentarioTexto, setComentarioTexto] = useState<string>('');
  const [estaEnviando, setEstaEnviando] = useState<boolean>(false);
  const [respuestaExitosa, setRespuestaExitosa] = useState<RespuestaRegistroEmocion | null>(null);
  const [respuestaIntensidad, setRespuestaIntensidad] = useState<RespuestaRegistroIntensidad | null>(null);
  const [respuestaComentario, setRespuestaComentario] = useState<RespuestaRegistroComentario | null>(null);
  const [segundosBloqueoRestantes, setSegundosBloqueoRestantes] = useState<number>(0);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState<boolean>(false);

  const [ubicacion, setUbicacion] = useState<EstadoUbicacion>({
    modo: 'MANUAL',
    zonaManualId: 'ZONA-PARQUE-CALDAS',
    nombreZona: 'Parque Caldas',
  });

  // Carga inicial de los catálogos oficiales desde la base de datos (HU-01, HU-04, HU-12)
  useEffect(() => {
    let montado = true;
    async function inicializarCatalogos() {
      try {
        setCargandoCatalogos(true);
        const [emocionesDb, zonasDb] = await Promise.all([
          obtenerCatalogoEmociones(),
          obtenerCatalogoZonas(),
        ]);
        if (montado) {
          if (emocionesDb && emocionesDb.length > 0) {
            setCatalogoEmociones(emocionesDb);
          }
          if (zonasDb && zonasDb.length > 0) {
            setCatalogoZonas(zonasDb);
            setUbicacion((prev) => ({
              ...prev,
              zonaManualId: prev.zonaManualId || zonasDb[0].zonaManualId,
              nombreZona: prev.nombreZona || zonasDb[0].nombre,
            }));
          }
        }
      } catch (err) {
        console.warn('Error cargando catálogos desde el backend:', err);
      } finally {
        if (montado) setCargandoCatalogos(false);
      }
    }

    inicializarCatalogos();
    return () => {
      montado = false;
    };
  }, []);

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
   * Maneja la selección de una tarjeta de emoción (HU-01).
   * Habilita de inmediato (< 100 ms) el selector de intensidad (HU-02).
   */
  const manejarSeleccionEmocion = (emocion: DefinicionEmocion) => {
    if (segundosBloqueoRestantes > 0) {
      Alert.alert(
        'Período de Espera Activo',
        `Ya registraste tu emoción. Podrás enviar un nuevo reporte en ${formatearTiempo(
          segundosBloqueoRestantes
        )} minutos.`
      );
      return;
    }

    // Actualización de estado en React: se habilita el selector en < 100 ms
    setEmocionSeleccionada(emocion);
  };

  /**
   * Envía la emoción seleccionada (HU-01), su intensidad asociada (HU-02),
   * y el comentario opcional (HU-03) asociado al mismo evento.
   */
  const manejarEnvioReporte = async (comentarioOpcional?: string) => {
    if (!emocionSeleccionada) {
      Alert.alert('Selección requerida', 'Por favor selecciona primero una emoción de la lista.');
      return;
    }

    if (segundosBloqueoRestantes > 0) {
      Alert.alert(
        'Período de Espera Activo',
        `Debes esperar ${formatearTiempo(segundosBloqueoRestantes)} antes de registrar otra emoción.`
      );
      return;
    }

    try {
      setEstaEnviando(true);
      // Opciones de ubicación para HU-04 (GPS o zona manual del catálogo DB)
      const opcionesUbicacion =
        ubicacion.modo === 'GPS' && ubicacion.latitud !== undefined && ubicacion.longitud !== undefined
          ? { latitud: ubicacion.latitud, longitud: ubicacion.longitud }
          : { zonaManualId: ubicacion.zonaManualId || 'ZONA-PARQUE-CALDAS' };

      // Paso 1: Registrar emoción base y ubicación (HU-01 y HU-04) para obtener idEvento oficial
      const resEmocion = await enviarSeleccionEmocion(emocionSeleccionada.id, opcionesUbicacion);
      setRespuestaExitosa(resEmocion);

      // Paso 2: Asociar e indicar intensidad (HU-02) con el idEvento generado
      const resIntensidad = await enviarRegistroIntensidad(
        resEmocion.idEvento,
        nivelIntensidad
      );
      setRespuestaIntensidad(resIntensidad);

      // Paso 3: Asociar comentario opcional (HU-03) si fue provisto
      const textoAEnviar = comentarioOpcional !== undefined ? comentarioOpcional : comentarioTexto;
      if (textoAEnviar && textoAEnviar.trim().length > 0) {
        const resComentario = await enviarRegistroComentario(
          resEmocion.idEvento,
          textoAEnviar.trim()
        );
        setRespuestaComentario(resComentario);
      } else {
        setRespuestaComentario(null);
      }

      // Iniciar período de bloqueo de seguridad
      setSegundosBloqueoRestantes(resEmocion.segundosBloqueo || 900);
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
          error.mensaje || 'No se pudo registrar el reporte con el servidor.'
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

        {/* Componente Selector de Ubicación (HU-04 - GPS y Catálogo de Zonas de BD) */}
        <SelectorUbicacion
          zonasDisponibles={catalogoZonas}
          ubicacionActual={ubicacion}
          alCambiarUbicacion={(nueva) => setUbicacion(nueva)}
          deshabilitado={estaEnviando || segundosBloqueoRestantes > 0}
        />

        {/* Grilla de Emociones (HU-01 y HU-12 - Catálogo dinámico desde Base de Datos) */}
        {cargandoCatalogos ? (
          <View style={estilos.contenedorCarga}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={estilos.textoCarga}>Cargando catálogo oficial...</Text>
          </View>
        ) : (
          <View style={estilos.grillaEmociones}>
            {catalogoEmociones.map((emocion) => (
              <View key={emocion.id} style={estilos.columnaGrilla}>
                <TarjetaEmocion
                  emocion={emocion}
                  seleccionada={emocionSeleccionada?.id === emocion.id}
                  alSeleccionar={manejarSeleccionEmocion}
                  deshabilitada={estaEnviando || segundosBloqueoRestantes > 0}
                />
              </View>
            ))}
            {/* Elemento vacío para balancear la grilla de 2 columnas si es impar */}
            {catalogoEmociones.length % 2 !== 0 && (
              <View style={estilos.columnaGrilla} />
            )}
          </View>
        )}

        {/* Componente Selector de Intensidad (HU-02 - Mockup image2.png) */}
        <SelectorIntensidad
          nivelSeleccionado={nivelIntensidad}
          alCambiarNivel={(nuevo) => setNivelIntensidad(nuevo)}
          deshabilitado={!emocionSeleccionada || estaEnviando || segundosBloqueoRestantes > 0}
        />

        {/* Componente Selector de Comentario Opcional (HU-03 - Mockup image4.png) */}
        {emocionSeleccionada && (
          <SelectorComentario
            comentarioInicial={comentarioTexto}
            alConfirmarComentario={(nuevo) => {
              setComentarioTexto(nuevo);
              manejarEnvioReporte(nuevo);
            }}
            alOmitir={() => {
              setComentarioTexto('');
              manejarEnvioReporte('');
            }}
            estaEnviando={estaEnviando}
            deshabilitado={segundosBloqueoRestantes > 0}
          />
        )}

        {/* Botón principal de acción para enviar reporte completo */}
        <TouchableOpacity
          style={[
            estilos.botonEnviarReporte,
            (!emocionSeleccionada || estaEnviando || segundosBloqueoRestantes > 0) &&
              estilos.botonEnviarReporteDeshabilitado,
          ]}
          disabled={!emocionSeleccionada || estaEnviando || segundosBloqueoRestantes > 0}
          onPress={() => manejarEnvioReporte()}
          activeOpacity={0.8}
        >
          {estaEnviando ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={estilos.textoBotonEnviar}>
              {emocionSeleccionada
                ? `Enviar Señal (${emocionSeleccionada.etiqueta} • Nivel ${nivelIntensidad} • ${
                    ubicacion.modo === 'GPS' ? 'GPS' : ubicacion.nombreZona || 'Zona'
                  })`
                : 'Selecciona una emoción'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Confirmación Exitosa (HU-01, HU-02, HU-03 y HU-04) */}
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

            <Text style={estilos.tituloModal}>¡Reporte Registrado!</Text>
            <Text style={estilos.mensajeModal}>
              Has registrado{' '}
              <Text
                style={{
                  color: emocionSeleccionada?.colorPrincipal || '#10B981',
                  fontWeight: '700',
                }}
              >
                {emocionSeleccionada?.etiqueta}
              </Text>{' '}
              con una intensidad de{' '}
              <Text style={{ fontWeight: '700', color: '#111827' }}>
                Nivel {nivelIntensidad} ({obtenerEtiquetaIntensidad(nivelIntensidad)})
              </Text>
              .
            </Text>

            {/* Detalle Geoespacial Anónimo (HU-04) */}
            <View style={estilos.badgeModalUbicacion}>
              <Text style={estilos.textoBadgeUbicacion}>
                📍 {respuestaExitosa?.nombreZona || ubicacion.nombreZona || 'Zona Urbana Registrada'}
              </Text>
              {respuestaExitosa?.idCeldaH3 && (
                <Text style={estilos.textoBadgeCelda}>
                  Celda H3 (Res 9): {respuestaExitosa.idCeldaH3}
                </Text>
              )}
            </View>

            {/* Detalle del Comentario Opcional (HU-03) */}
            <View style={estilos.badgeModalComentario}>
              <Text style={estilos.textoBadgeComentarioTitulo}>
                💬 {respuestaComentario?.comentario ? 'Comentario Registrado:' : 'Contexto Opcional:'}
              </Text>
              <Text style={estilos.textoBadgeComentarioCuerpo}>
                {respuestaComentario?.comentario
                  ? `"${respuestaComentario.comentario}"`
                  : 'Sin comentario adicional (opcional)'}
              </Text>
            </View>

            <Text style={estilos.subtextoModalPrivacidad}>
              Tu reporte 100% anónimo ha sido sumado al mapa colectivo de la comunidad Almara.
            </Text>

            <TouchableOpacity
              style={[estilos.botonCerrarModal, { backgroundColor: '#0284C7', marginBottom: 10 }]}
              onPress={() => {
                setMostrarModalConfirmacion(false);
                setEmocionSeleccionada(null);
                setNivelIntensidad(INTENSIDAD_PREDETERMINADA);
                setComentarioTexto('');
                setRespuestaComentario(null);
                reiniciarTokenSesion();
                setSegundosBloqueoRestantes(0);
                if (alNavegar) alNavegar('explorar');
              }}
            >
              <Text style={estilos.textoBotonModal}>🗺️ Ver en el Mapa en Vivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.botonCerrarModal, { backgroundColor: '#10B981', marginBottom: 10 }]}
              onPress={() => {
                setMostrarModalConfirmacion(false);
                setEmocionSeleccionada(null);
                setNivelIntensidad(INTENSIDAD_PREDETERMINADA);
                setComentarioTexto('');
                setRespuestaComentario(null);
                reiniciarTokenSesion();
                setSegundosBloqueoRestantes(0);
              }}
            >
              <Text style={estilos.textoBotonModal}>➕ Registrar otra emoción (Modo prueba)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botonCerrarModal}
              onPress={() => {
                setMostrarModalConfirmacion(false);
                setEmocionSeleccionada(null);
                setNivelIntensidad(INTENSIDAD_PREDETERMINADA);
                setComentarioTexto('');
                setRespuestaComentario(null);
                reiniciarTokenSesion();
                setSegundosBloqueoRestantes(0);
              }}
            >
              <Text style={estilos.textoBotonModal}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra de navegación inferior */}
      <BarraNavegacionInferior
        pestañaActiva="registrar"
        alCambiarPestaña={(p) => alNavegar && alNavegar(p)}
      />
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
    marginBottom: 16,
  },
  badgeModalUbicacion: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  textoBadgeUbicacion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  textoBadgeCelda: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badgeModalComentario: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  textoBadgeComentarioTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 3,
  },
  textoBadgeComentarioCuerpo: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtextoModalPrivacidad: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
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
  botonEnviarReporte: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botonEnviarReporteDeshabilitado: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  textoBotonEnviar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
