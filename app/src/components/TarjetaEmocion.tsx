import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DefinicionEmocion } from '../constants/emociones';
import { IconoEmocion } from './IconoEmocion';

interface PropiedadesTarjetaEmocion {
  emocion: DefinicionEmocion;
  seleccionada: boolean;
  alSeleccionar: (emocion: DefinicionEmocion) => void;
  deshabilitada?: boolean;
}

export const TarjetaEmocion: React.FC<PropiedadesTarjetaEmocion> = ({
  emocion,
  seleccionada,
  alSeleccionar,
  deshabilitada = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={deshabilitada}
      onPress={() => alSeleccionar(emocion)}
      accessibilityRole="button"
      accessibilityLabel={`Seleccionar emoción ${emocion.etiqueta}`}
      style={[
        estilos.tarjeta,
        seleccionada && { borderColor: emocion.colorPrincipal, borderWidth: 2 },
        deshabilitada && estilos.tarjetaDeshabilitada,
      ]}
    >
      <View
        style={[
          estilos.circuloIcono,
          { backgroundColor: emocion.colorFondoCirculo },
        ]}
      >
        <IconoEmocion emocion={emocion.id} color={emocion.colorPrincipal} size={36} />
      </View>
      <Text style={estilos.etiqueta}>{emocion.etiqueta}</Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Sombra suave en iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    // Sombra en Android
    elevation: 2,
  },
  tarjetaDeshabilitada: {
    opacity: 0.5,
  },
  circuloIcono: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  textoIcono: {
    fontSize: 34,
  },
  etiqueta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
