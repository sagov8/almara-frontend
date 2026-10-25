import React from 'react';
import {
  Smile,
  Meh,
  Frown,
  Flame,
  CloudRain,
  Zap,
  Heart,
  Sparkles,
  Sun,
  Shield,
  AlertCircle,
  Coffee,
  ThumbsUp,
  Activity,
  Compass,
  Lock,
  MapPin,
  HelpCircle,
} from 'lucide-react-native';

export interface PropiedadesIconoEmocion {
  icono?: string | null;
  emocion?: string | null;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Componente que mapea cualquier emoción o nombre de ícono del catálogo oficial Almara
 * a un icono vectorial de Lucide Icons en React Native.
 * Permite compatibilidad total con los íconos configurados en el panel de Administración.
 */
export const IconoEmocion: React.FC<PropiedadesIconoEmocion> = ({
  icono,
  emocion,
  color = '#475569',
  size = 20,
  strokeWidth = 2.2,
}) => {
  const clave = (icono || emocion || '').toString().trim().toLowerCase();

  switch (clave) {
    case 'smile':
    case 'felicidad':
    case 'sonrisa':
    case '😊':
    case '😄':
    case '😃':
      return <Smile size={size} color={color} strokeWidth={strokeWidth} />;

    case 'meh':
    case 'neutralidad':
    case 'neutral':
    case '😐':
    case '😶':
      return <Meh size={size} color={color} strokeWidth={strokeWidth} />;

    case 'frown':
    case 'preocupacion':
    case 'preocupación':
    case 'tristeza':
    case '😟':
    case '😢':
    case '😥':
      return <Frown size={size} color={color} strokeWidth={strokeWidth} />;

    case 'flame':
    case 'enfado':
    case 'ira':
    case 'fuego':
    case '😠':
    case '😡':
    case '🔥':
      return <Flame size={size} color={color} strokeWidth={strokeWidth} />;

    case 'cloudrain':
    case 'cloud-rain':
    case 'cloud_rain':
    case 'ansiedad':
    case 'estres':
    case 'estrés':
    case 'lluvia':
    case '😰':
    case '🌧️':
    case '🌧':
      return <CloudRain size={size} color={color} strokeWidth={strokeWidth} />;

    case 'zap':
    case 'rayo':
    case 'energia':
    case 'energía':
    case '⚡':
      return <Zap size={size} color={color} strokeWidth={strokeWidth} />;

    case 'heart':
    case 'corazon':
    case 'corazón':
    case 'afecto':
    case '❤️':
    case '💖':
      return <Heart size={size} color={color} strokeWidth={strokeWidth} />;

    case 'sparkles':
    case 'destellos':
    case 'brillo':
    case '✨':
      return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;

    case 'sun':
    case 'sol':
    case '☀️':
    case '🌞':
      return <Sun size={size} color={color} strokeWidth={strokeWidth} />;

    case 'shield':
    case 'escudo':
    case 'seguridad':
    case '🛡️':
    case '🛡':
      return <Shield size={size} color={color} strokeWidth={strokeWidth} />;

    case 'alertcircle':
    case 'alert-circle':
    case 'alerta':
    case '⚠️':
      return <AlertCircle size={size} color={color} strokeWidth={strokeWidth} />;

    case 'coffee':
    case 'cafe':
    case 'café':
    case '☕':
      return <Coffee size={size} color={color} strokeWidth={strokeWidth} />;

    case 'thumbsup':
    case 'thumbs-up':
    case 'aprobacion':
    case 'aprobación':
    case '👍':
      return <ThumbsUp size={size} color={color} strokeWidth={strokeWidth} />;

    case 'activity':
    case 'actividad':
    case 'pulso':
      return <Activity size={size} color={color} strokeWidth={strokeWidth} />;

    case 'compass':
    case 'brujula':
    case 'brújula':
    case '🧭':
      return <Compass size={size} color={color} strokeWidth={strokeWidth} />;

    case 'lock':
    case 'candado':
    case 'protegida':
    case 'reserva':
    case '🔒':
      return <Lock size={size} color={color} strokeWidth={strokeWidth} />;

    case 'mappin':
    case 'map-pin':
    case 'ubicacion':
    case 'ubicación':
    case '📍':
      return <MapPin size={size} color={color} strokeWidth={strokeWidth} />;

    default:
      return <Smile size={size} color={color} strokeWidth={strokeWidth} />;
  }
};
