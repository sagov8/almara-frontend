import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, PlusCircle, Compass, Shield } from 'lucide-react-native';

export type PestañaNavegacion = 'inicio' | 'registrar' | 'explorar' | 'privacidad';

interface PropiedadesBarraNavegacion {
  pestañaActiva: PestañaNavegacion;
  alCambiarPestaña: (pestaña: PestañaNavegacion) => void;
}

/**
 * Barra de navegación inferior simétrica y consistente con Lucide Icons.
 * Todos los botones tienen el mismo estilo uniforme y seleccionable.
 */
export const BarraNavegacionInferior: React.FC<PropiedadesBarraNavegacion> = ({
  pestañaActiva,
  alCambiarPestaña,
}) => {
  const COLOR_ACTIVO = '#0284C7';
  const COLOR_INACTIVO = '#64748B';

  const items = [
    {
      id: 'inicio' as PestañaNavegacion,
      etiqueta: 'Inicio',
      icono: (activo: boolean) => (
        <Home size={22} color={activo ? COLOR_ACTIVO : COLOR_INACTIVO} strokeWidth={activo ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'registrar' as PestañaNavegacion,
      etiqueta: 'Registrar',
      icono: (activo: boolean) => (
        <PlusCircle size={22} color={activo ? COLOR_ACTIVO : COLOR_INACTIVO} strokeWidth={activo ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'explorar' as PestañaNavegacion,
      etiqueta: 'Explorar',
      icono: (activo: boolean) => (
        <Compass size={22} color={activo ? COLOR_ACTIVO : COLOR_INACTIVO} strokeWidth={activo ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'privacidad' as PestañaNavegacion,
      etiqueta: 'Privacidad',
      icono: (activo: boolean) => (
        <Shield size={22} color={activo ? COLOR_ACTIVO : COLOR_INACTIVO} strokeWidth={activo ? 2.4 : 1.8} />
      ),
    },
  ];

  return (
    <View style={estilos.contenedor}>
      {items.map((item) => {
        const activo = pestañaActiva === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[estilos.botonPestaña, activo && estilos.botonPestañaActivo]}
            onPress={() => alCambiarPestaña(item.id)}
            activeOpacity={0.7}
          >
            <View style={estilos.contenedorIcono}>
              {item.icono(activo)}
            </View>
            <Text style={[estilos.textoPestaña, activo && estilos.textoPestañaActivo]}>
              {item.etiqueta}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  botonPestaña: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  botonPestañaActivo: {
    backgroundColor: '#F0F9FF',
  },
  contenedorIcono: {
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPestaña: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  textoPestañaActivo: {
    color: '#0284C7',
    fontWeight: '700',
  },
});
