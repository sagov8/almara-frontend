/**
 * Catálogo oficial de emociones predeterminadas de Almara (HU-01).
 * Corresponde a los colores y disposición del mockup de la interfaz móvil.
 */

export interface DefinicionEmocion {
  id: 'FELICIDAD' | 'NEUTRALIDAD' | 'PREOCUPACION' | 'ENFADO' | 'ANSIEDAD';
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
    simboloFacial: '😊',
  },
  {
    id: 'NEUTRALIDAD',
    etiqueta: 'Neutralidad',
    colorPrincipal: '#EAB308',
    colorFondoCirculo: '#FEF9C3',
    descripcion: 'Estado equilibrado, tranquilo y regular.',
    simboloFacial: '😐',
  },
  {
    id: 'PREOCUPACION',
    etiqueta: 'Preocupación',
    colorPrincipal: '#F97316',
    colorFondoCirculo: '#FFEDD5',
    descripcion: 'Inquietud o tensión moderada ante una situación.',
    simboloFacial: '😟',
  },
  {
    id: 'ENFADO',
    etiqueta: 'Enfado',
    colorPrincipal: '#EF4444',
    colorFondoCirculo: '#FEE2E2',
    descripcion: 'Molestia, frustración o irritación.',
    simboloFacial: '😠',
  },
  {
    id: 'ANSIEDAD',
    etiqueta: 'Ansiedad',
    colorPrincipal: '#8B5CF6',
    colorFondoCirculo: '#EDE9FE',
    descripcion: 'Nerviosismo, agobio o estrés acumulado.',
    simboloFacial: '😰',
  },
];
