/**
 * Definición oficial de la escala de intensidad para emociones Almara (HU-02).
 * Alineado con el diseño visual del mockup (image2.png) y las consideraciones de la HU-02.
 */

export interface DefinicionIntensidad {
  nivel: number;
  etiqueta: string;
  descripcion: string;
}

export const ESCALA_INTENSIDAD: DefinicionIntensidad[] = [
  { nivel: 1, etiqueta: 'Leve', descripcion: 'Emoción apenas perceptible o suave' },
  { nivel: 2, etiqueta: 'Leve-Moderado', descripcion: 'Emoción baja con presencia constante' },
  { nivel: 3, etiqueta: 'Moderado', descripcion: 'Emoción en nivel estándar de presencia' },
  { nivel: 4, etiqueta: 'Moderado-Intenso', descripcion: 'Emoción marcada y notoria' },
  { nivel: 5, etiqueta: 'Intenso', descripcion: 'Emoción muy fuerte y predominante' },
];

export const INTENSIDAD_PREDETERMINADA = 3;

/**
 * Obtiene la etiqueta amigable asociada a un nivel numérico (1 a 5).
 */
export function obtenerEtiquetaIntensidad(nivel: number): string {
  const encontrada = ESCALA_INTENSIDAD.find((i) => i.nivel === nivel);
  return encontrada ? encontrada.etiqueta : `Nivel ${nivel}`;
}
