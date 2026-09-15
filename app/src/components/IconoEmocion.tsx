import React from 'react';
import {
  Smile,
  Meh,
  Frown,
  Flame,
  CloudRain,
  Lock,
  Heart,
  HelpCircle,
} from 'lucide-react-native';

interface PropiedadesIconoEmocion {
  emocion?: string | null;
  color?: string;
  size?: number;
}

/**
 * Componente que mapea cada emoción de Almara a un icono vectorial de Lucide Icons.
 * Reemplaza los emojis por iconografía profesional y consistente.
 */
export const IconoEmocion: React.FC<PropiedadesIconoEmocion> = ({
  emocion,
  color = '#475569',
  size = 20,
}) => {
  const clave = (emocion || '').toUpperCase();

  switch (clave) {
    case 'FELICIDAD':
      return <Smile size={size} color={color} strokeWidth={2.2} />;
    case 'NEUTRALIDAD':
      return <Meh size={size} color={color} strokeWidth={2.2} />;
    case 'PREOCUPACION':
      return <Frown size={size} color={color} strokeWidth={2.2} />;
    case 'ENFADO':
      return <Flame size={size} color={color} strokeWidth={2.2} />;
    case 'ANSIEDAD':
      return <CloudRain size={size} color={color} strokeWidth={2.2} />;
    case 'PROTEGIDA':
      return <Lock size={size} color={color} strokeWidth={2.2} />;
    default:
      return <Smile size={size} color={color} strokeWidth={2.2} />;
  }
};
