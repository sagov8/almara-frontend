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
  LucideIcon,
} from 'lucide-react';

export interface DefinicionIconoLucide {
  id: string;
  nombre: string;
  descripcion: string;
  Icono: LucideIcon;
}

/**
 * Catálogo normalizado de íconos vectoriales Lucide para emociones y estados urbanos.
 * Permite selección coherente tanto en Administración como en Clientes Institucionales y App Móvil.
 */
export const ICONOS_LUCIDE_CATALOGO: DefinicionIconoLucide[] = [
  { id: 'Smile', nombre: 'Sonrisa', descripcion: 'Felicidad, optimismo y bienestar', Icono: Smile },
  { id: 'Meh', nombre: 'Neutral', descripcion: 'Tranquilidad, neutralidad y serenidad', Icono: Meh },
  { id: 'Frown', nombre: 'Preocupación', descripcion: 'Inquietud, tristeza o aflicción', Icono: Frown },
  { id: 'Flame', nombre: 'Fuego', descripcion: 'Enfado, frustración o irritación', Icono: Flame },
  { id: 'CloudRain', nombre: 'Lluvia', descripcion: 'Ansiedad, agobio o melancolía', Icono: CloudRain },
  { id: 'Zap', nombre: 'Rayo', descripcion: 'Tensión, energía o estrés súbito', Icono: Zap },
  { id: 'Heart', nombre: 'Corazón', descripcion: 'Afecto, gratitud o empatía', Icono: Heart },
  { id: 'Sparkles', nombre: 'Destellos', descripcion: 'Inspiración, entusiasmo o alegría', Icono: Sparkles },
  { id: 'Sun', nombre: 'Sol', descripcion: 'Claridad, vitalidad y esperanza', Icono: Sun },
  { id: 'Shield', nombre: 'Escudo', descripcion: 'Seguridad, protección y confianza', Icono: Shield },
  { id: 'AlertCircle', nombre: 'Alerta', descripcion: 'Precaución, atención o aviso', Icono: AlertCircle },
  { id: 'Coffee', nombre: 'Café', descripcion: 'Pausa, sosiego y reflexión', Icono: Coffee },
  { id: 'ThumbsUp', nombre: 'Aprobación', descripcion: 'Satisfacción y conformidad', Icono: ThumbsUp },
  { id: 'Activity', nombre: 'Actividad', descripcion: 'Pulso vital y dinamismo', Icono: Activity },
  { id: 'Compass', nombre: 'Brújula', descripcion: 'Orientación y exploración', Icono: Compass },
  { id: 'Lock', nombre: 'Candado', descripcion: 'Privacidad y reserva ciudadana', Icono: Lock },
];

const MAPA_ICONOS_POR_ID: Record<string, LucideIcon> = {
  // Nombres directos en PascalCase y minúsculas
  smile: Smile,
  meh: Meh,
  frown: Frown,
  flame: Flame,
  cloudrain: CloudRain,
  cloud_rain: CloudRain,
  'cloud-rain': CloudRain,
  zap: Zap,
  heart: Heart,
  sparkles: Sparkles,
  sun: Sun,
  shield: Shield,
  alertcircle: AlertCircle,
  'alert-circle': AlertCircle,
  coffee: Coffee,
  thumbsup: ThumbsUp,
  'thumbs-up': ThumbsUp,
  activity: Activity,
  compass: Compass,
  lock: Lock,
  mappin: MapPin,
  'map-pin': MapPin,
  helpcircle: HelpCircle,
  'help-circle': HelpCircle,

  // Códigos de emoción del enum core Almara
  felicidad: Smile,
  neutralidad: Meh,
  preocupacion: Frown,
  preocupación: Frown,
  enfado: Flame,
  ira: Flame,
  ansiedad: CloudRain,
  estres: CloudRain,
  estrés: CloudRain,
  protegida: Lock,
  reserva: Lock,

  // Fallback de emojis heredados para retrocompatibilidad
  '😊': Smile,
  '😄': Smile,
  '😃': Smile,
  '😐': Meh,
  '😶': Meh,
  '😟': Frown,
  '😢': Frown,
  '😥': Frown,
  '😠': Flame,
  '😡': Flame,
  '🔥': Flame,
  '😰': CloudRain,
  '🌧️': CloudRain,
  '🌧': CloudRain,
  '⚡': Zap,
  '❤️': Heart,
  '✨': Sparkles,
  '☀️': Sun,
  '🔒': Lock,
  '📍': MapPin,
};

export interface IconoEmocionLucideProps {
  icono?: string | null;
  idEmocion?: string | null;
  color?: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Componente que normaliza y renderiza un ícono vectorial de Lucide Icons
 * eliminando el uso de emoticones o emojis de texto en toda la plataforma.
 */
export const IconoEmocionLucide: React.FC<IconoEmocionLucideProps> = ({
  icono,
  idEmocion,
  color,
  className = 'w-5 h-5',
  size,
  strokeWidth = 2.2,
}) => {
  const claveIcono = (icono || '').trim();
  const claveId = (idEmocion || '').trim().toLowerCase();

  // 1. Intentar resolver por el identificador de ícono exacto (emoji, PascalCase o minúscula)
  let Componente = MAPA_ICONOS_POR_ID[claveIcono.toLowerCase()] || MAPA_ICONOS_POR_ID[claveIcono];

  // 2. Si no coincide, intentar resolver por idEmocion
  if (!Componente && claveId) {
    Componente = MAPA_ICONOS_POR_ID[claveId];
  }

  // 3. Fallback a Smile si no hay coincidencia
  if (!Componente) {
    Componente = Smile;
  }

  return (
    <Componente
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
};
