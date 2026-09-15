import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, ChevronUp, ChevronDown, Palette } from 'lucide-react-native';
import { IconoEmocion } from './IconoEmocion';

interface ItemEmocion {
  id: string;
  nombre: string;
  color: string;
}

const CONVENCIONES_EMOCIONES: ItemEmocion[] = [
  { id: 'FELICIDAD', nombre: 'Felicidad', color: '#10B981' },
  { id: 'NEUTRALIDAD', nombre: 'Neutralidad', color: '#F59E0B' },
  { id: 'PREOCUPACION', nombre: 'Preocupación', color: '#F97316' },
  { id: 'ENFADO', nombre: 'Enfado', color: '#EF4444' },
  { id: 'ANSIEDAD', nombre: 'Ansiedad', color: '#8B5CF6' },
];

interface PropiedadesLeyenda {
  onPresionarInfo?: () => void;
}

/**
 * Componente interactivo de Leyenda Emocional con Lucide Icons (HU-05).
 * Reemplaza emojis por iconografía vectorial profesional y limpia.
 */
export const LeyendaEmociones: React.FC<PropiedadesLeyenda> = ({ onPresionarInfo }) => {
  const [expandido, setExpandido] = useState<boolean>(true);

  return (
    <View style={estilos.contenedorPrincipal}>
      <TouchableOpacity
        style={estilos.cabecera}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.8}
      >
        <View style={estilos.filaTitulo}>
          <View style={estilos.tituloConIcono}>
            <Palette size={16} color="#1E293B" strokeWidth={2.2} />
            <Text style={estilos.titulo}>Clima Emocional</Text>
          </View>
          {expandido ? (
            <ChevronUp size={16} color="#64748B" strokeWidth={2} />
          ) : (
            <ChevronDown size={16} color="#64748B" strokeWidth={2} />
          )}
        </View>
      </TouchableOpacity>

      {expandido && (
        <View style={estilos.contenido}>
          <View style={estilos.grillaEmociones}>
            {CONVENCIONES_EMOCIONES.map((item) => (
              <View key={item.id} style={estilos.itemEmocion}>
                <View style={[estilos.puntoColor, { backgroundColor: item.color }]} />
                <View style={estilos.contenedorIcono}>
                  <IconoEmocion emocion={item.id} color={item.color} size={15} />
                </View>
                <Text style={estilos.etiquetaEmocion}>{item.nombre}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={estilos.badgeProteccion}
            onPress={onPresionarInfo}
            activeOpacity={0.7}
          >
            <Shield size={14} color="#1D4ED8" strokeWidth={2.2} />
            <Text style={estilos.textoProteccion}>
              Protección en Comunidad: mínimo 5 vecinos
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorPrincipal: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cabecera: {
    paddingVertical: 2,
  },
  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  contenido: {
    marginTop: 8,
  },
  grillaEmociones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemEmocion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  puntoColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  contenedorIcono: {
    marginRight: 5,
  },
  etiquetaEmocion: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  badgeProteccion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 6,
  },
  textoProteccion: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
