import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ESCALA_INTENSIDAD, obtenerEtiquetaIntensidad } from '../constants/intensidades';

interface PropiedadesSelectorIntensidad {
  nivelSeleccionado: number;
  alCambiarNivel: (nuevoNivel: number) => void;
  deshabilitado?: boolean;
}

/**
 * Componente de interfaz de usuario para indicar la intensidad de la emoción (HU-02).
 * Fiel al diseño visual del Mockup (image2.png):
 * - Título: "Intensidad (1-5)"
 * - Barra deslizante interactiva con 5 niveles (1 a 5).
 * - Indicadores textuales: "Leve" (1), "Moderado" (3), "Intenso" (5).
 * - Permite interacción tanto por toque directo en los puntos como por arrastre fluido.
 * - Deshabilitado por defecto hasta que se seleccione una emoción válida (RNF Usabilidad < 100 ms).
 */
export const SelectorIntensidad: React.FC<PropiedadesSelectorIntensidad> = ({
  nivelSeleccionado,
  alCambiarNivel,
  deshabilitado = true,
}) => {
  const [anchoPista, setAnchoPista] = useState<number>(0);
  const anchoPistaRef = useRef<number>(0);

  // Calcula el nivel (1 a 5) a partir de una coordenada X dentro de la barra
  const calcularNivelDesdePosicionX = (posicionX: number): number => {
    const ancho = anchoPistaRef.current;
    if (ancho <= 0) return 3;

    // Normalizar posición relativa de 0 a 1
    const porcentaje = Math.max(0, Math.min(1, posicionX / ancho));
    // Mapear a escala de 1 a 5
    const nivelCalculado = Math.round(porcentaje * 4) + 1;
    return Math.max(1, Math.min(5, nivelCalculado));
  };

  // PanResponder para permitir arrastre fluido del cursor circular
  const respondedorArrastre = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !deshabilitado,
      onMoveShouldSetPanResponder: () => !deshabilitado,
      onPanResponderGrant: (evt) => {
        if (deshabilitado) return;
        const nuevoNivel = calcularNivelDesdePosicionX(evt.nativeEvent.locationX);
        alCambiarNivel(nuevoNivel);
      },
      onPanResponderMove: (evt) => {
        if (deshabilitado) return;
        const nuevoNivel = calcularNivelDesdePosicionX(evt.nativeEvent.locationX);
        alCambiarNivel(nuevoNivel);
      },
    })
  ).current;

  const manejarCambioDimension = (evento: LayoutChangeEvent) => {
    const ancho = evento.nativeEvent.layout.width;
    setAnchoPista(ancho);
    anchoPistaRef.current = ancho;
  };

  // Calcula la posición porcentual del thumb (0% para nivel 1, 100% para nivel 5)
  const porcentajeThumb = ((nivelSeleccionado - 1) / 4) * 100;

  return (
    <View
      style={[
        estilos.tarjetaContenedora,
        deshabilitado && estilos.tarjetaDeshabilitada,
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Selector de intensidad de la emoción, valor actual ${nivelSeleccionado} (${obtenerEtiquetaIntensidad(
        nivelSeleccionado
      )})`}
    >
      {/* Cabecera de la tarjeta con título del mockup */}
      <View style={estilos.filaCabecera}>
        <Text style={estilos.titulo}>Intensidad (1-5)</Text>
        <View style={estilos.insigniaValor}>
          <Text style={estilos.textoInsignia}>
            {nivelSeleccionado} — {obtenerEtiquetaIntensidad(nivelSeleccionado)}
          </Text>
        </View>
      </View>

      {/* Barra y control deslizante (Mockup image2.png) */}
      <View
        style={estilos.areaInteractiva}
        onLayout={manejarCambioDimension}
        {...respondedorArrastre.panHandlers}
      >
        {/* Pista base */}
        <View style={estilos.pistaFondo}>
          {/* Pista de progreso activa */}
          <View
            style={[
              estilos.pistaActiva,
              { width: `${porcentajeThumb}%` },
            ]}
          />
        </View>

        {/* Indicadores de paso discretos (1 a 5) */}
        {anchoPista > 0 && (
          <View style={[estilos.capaPuntosPaso, { pointerEvents: 'box-none' as any }]}>
            {ESCALA_INTENSIDAD.map((paso) => {
              const posLeft = ((paso.nivel - 1) / 4) * (anchoPista - 24);
              const estaActivo = paso.nivel <= nivelSeleccionado;
              return (
                <TouchableOpacity
                  key={paso.nivel}
                  disabled={deshabilitado}
                  onPress={() => alCambiarNivel(paso.nivel)}
                  style={[
                    estilos.puntoPaso,
                    { left: posLeft },
                    estaActivo && estilos.puntoPasoActivo,
                  ]}
                  accessibilityLabel={`Nivel ${paso.nivel} ${paso.etiqueta}`}
                />
              );
            })}
          </View>
        )}

        {/* Thumb circular oscuro del Mockup */}
        {anchoPista > 0 && (
          <View
            style={[
              estilos.circuloThumb,
              {
                left: ((nivelSeleccionado - 1) / 4) * (anchoPista - 24),
                pointerEvents: 'none' as any,
              },
            ]}
          />
        )}
      </View>

      {/* Etiquetas inferiores según Mockup: Leve, Moderado, Intenso */}
      <View style={estilos.filaEtiquetas}>
        <TouchableOpacity
          disabled={deshabilitado}
          onPress={() => alCambiarNivel(1)}
        >
          <Text
            style={[
              estilos.textoEtiqueta,
              nivelSeleccionado === 1 && estilos.textoEtiquetaActiva,
            ]}
          >
            Leve
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={deshabilitado}
          onPress={() => alCambiarNivel(3)}
        >
          <Text
            style={[
              estilos.textoEtiqueta,
              nivelSeleccionado === 3 && estilos.textoEtiquetaActiva,
            ]}
          >
            Moderado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={deshabilitado}
          onPress={() => alCambiarNivel(5)}
        >
          <Text
            style={[
              estilos.textoEtiqueta,
              nivelSeleccionado === 5 && estilos.textoEtiquetaActiva,
            ]}
          >
            Intenso
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mensaje de ayuda si está inhabilitado (Criterio 1: requiere emoción previa) */}
      {deshabilitado && (
        <View style={estilos.contenedorAvisoDeshabilitado}>
          <Text style={estilos.textoAvisoDeshabilitado}>
            🔒 Selecciona una emoción arriba para habilitar la intensidad.
          </Text>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjetaContenedora: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginHorizontal: 8,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tarjetaDeshabilitada: {
    opacity: 0.5,
  },
  filaCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  insigniaValor: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  textoInsignia: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  areaInteractiva: {
    height: 38,
    justifyContent: 'center',
    position: 'relative',
  },
  pistaFondo: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  pistaActiva: {
    height: '100%',
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  capaPuntosPaso: {
    ...StyleSheet.absoluteFillObject,
    height: 38,
  },
  puntoPaso: {
    position: 'absolute',
    top: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginLeft: 8,
  },
  puntoPasoActivo: {
    backgroundColor: '#111827',
  },
  circuloThumb: {
    position: 'absolute',
    top: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filaEtiquetas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  textoEtiqueta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  textoEtiquetaActiva: {
    fontWeight: '700',
    color: '#111827',
  },
  contenedorAvisoDeshabilitado: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoAvisoDeshabilitado: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
