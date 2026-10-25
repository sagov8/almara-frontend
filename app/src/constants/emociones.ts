/**
 * Catálogo oficial de emociones predeterminadas de Almara.
 * Corresponde a los colores y disposición del mockup de la interfaz móvil
 * y se sincroniza dinámicamente con la base de datos (módulo de administración).
 */

export interface DefinicionEmocion {
  id: string;
  etiqueta: string;
  colorPrincipal: string;
  colorFondoCirculo: string;
  descripcion: string;
  simboloFacial: string;
}

export const LISTA_EMOCIONES: DefinicionEmocion[] = [
  {
    id: 'FELICIDAD',
    etiqueta: 'Felicidad',
    colorPrincipal: '#10B981',
    colorFondoCirculo: '#D1FAE5',
    descripcion: 'Alegría, satisfacción y bienestar general.',
    simboloFacial: 'Smile',
  },
  {
    id: 'NEUTRALIDAD',
    etiqueta: 'Neutralidad',
    colorPrincipal: '#EAB308',
    colorFondoCirculo: '#FEF9C3',
    descripcion: 'Estado equilibrado, tranquilo y regular.',
    simboloFacial: 'Meh',
  },
  {
    id: 'PREOCUPACION',
    etiqueta: 'Preocupación',
    colorPrincipal: '#F97316',
    colorFondoCirculo: '#FFEDD5',
    descripcion: 'Inquietud o tensión moderada ante una situación.',
    simboloFacial: 'Frown',
  },
  {
    id: 'ENFADO',
    etiqueta: 'Enfado',
    colorPrincipal: '#EF4444',
    colorFondoCirculo: '#FEE2E2',
    descripcion: 'Molestia, frustración o irritación.',
    simboloFacial: 'Flame',
  },
  {
    id: 'ANSIEDAD',
    etiqueta: 'Ansiedad',
    colorPrincipal: '#8B5CF6',
    colorFondoCirculo: '#EDE9FE',
    descripcion: 'Nerviosismo, agobio o estrés acumulado.',
    simboloFacial: 'CloudRain',
  },
];
