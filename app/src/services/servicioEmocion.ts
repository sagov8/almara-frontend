import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DefinicionEmocion, LISTA_EMOCIONES } from '../constants/emociones';
import { obtenerTokenSesionTemporal } from './servicioSesion';

/**
 * Resuelve dinámicamente la URL base del backend de acuerdo con el entorno de ejecución:
 * - En navegador Web: http://localhost:8080/api/v1
 * - En dispositivo móvil físico con Expo Go: Detecta la IP del host de Metro (ej. 192.168.1.77)
 * - Fallback para red local: http://192.168.1.77:8080/api/v1
 */
export function obtenerUrlBase(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1';
  }

  // Extraer la IP local del equipo de desarrollo desde la configuración de Expo
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ipHost = hostUri.split(':')[0];
    if (ipHost && ipHost !== 'localhost' && ipHost !== '127.0.0.1') {
      return `http://${ipHost}:8080/api/v1`;
    }
  }

  // IP local de referencia en la red Wi-Fi
  return 'http://192.168.1.77:8080/api/v1';
}

export function obtenerUrlBaseEmociones(): string {
  return `${obtenerUrlBase()}/emociones`;
}

export function obtenerUrlBaseGeo(): string {
  return `${obtenerUrlBase()}/geo`;
}

// Retrocompatibilidad
export function obtenerUrlBaseApi(): string {
  return obtenerUrlBaseEmociones();
}

export interface SolicitudRegistroEmocion {
  emocion: DefinicionEmocion['id'];
  tokenSesionTemporal: string;
  zonaManualId?: string;
  latitud?: number;
  longitud?: number;
}

export interface RespuestaRegistroEmocion {
  idEvento: string;
  mensaje: string;
  emocionRegistrada: string;
  idCeldaH3?: string;
  nombreZona?: string;
  comentario?: string;
  fechaHoraEnvio: string;
  segundosBloqueo: number;
}

export interface ErrorRegistroEmocion {
  codigoEstado: number;
  error: string;
  mensaje: string;
  segundosRestantes?: number;
}

export interface SolicitudRegistroIntensidad {
  idEvento: string;
  nivelIntensidad: number;
}

export interface RespuestaRegistroIntensidad {
  idEvento: string;
  nivelIntensidad: number;
  etiquetaIntensidad: string;
  emocion: string;
  idCeldaH3: string;
  mensaje: string;
  fechaHoraEnvio: string;
}

export interface SolicitudRegistroComentario {
  idEvento: string;
  comentario: string;
}

export interface RespuestaRegistroComentario {
  idEvento: string;
  comentario?: string;
  mensaje: string;
  emocion: string;
  idCeldaH3: string;
  fechaHoraEnvio: string;
  commentContext?: string;
}

export interface ElementoCatalogoZona {
  zonaManualId: string;
  nombre: string;
  descripcion?: string;
  idCeldaH3: string;
  resolucionH3: number;
  latitudCentroide: number;
  longitudCentroide: number;
}

export const LISTA_ZONAS_PREDETERMINADAS: ElementoCatalogoZona[] = [
  {
    zonaManualId: 'ZONA-PARQUE-CALDAS',
    nombre: 'Parque Caldas',
    descripcion: 'Eje fundacional e histórico de Popayán, rodeado por la Catedral Basílica y la Torre del Reloj.',
    idCeldaH3: '8966c6c748fffff',
    resolucionH3: 9,
    latitudCentroide: 2.443431,
    longitudCentroide: -76.605638,
  },
  {
    zonaManualId: 'ZONA-HUMILLADERO',
    nombre: 'Puente del Humilladero',
    descripcion: 'Estructura patrimonial de once arcos de ladrillo sobre el río Molino hacia el norte de la ciudad.',
    idCeldaH3: '8966c6c7483ffff',
    resolucionH3: 9,
    latitudCentroide: 2.446669,
    longitudCentroide: -76.605328,
  },
  {
    zonaManualId: 'ZONA-MORRO-TULCAN',
    nombre: 'El Morro de Tulcán',
    descripcion: 'Sitio arqueológico prehispánico y mirador natural emblemático de Popayán.',
    idCeldaH3: '8966c6d5b4bffff',
    resolucionH3: 9,
    latitudCentroide: 2.445989,
    longitudCentroide: -76.599611,
  },
  {
    zonaManualId: 'ZONA-ERMITA',
    nombre: 'Ermita de Jesús Nazareno',
    descripcion: 'Templo colonial del siglo XVI sobre colina con vista panorámica al centro histórico.',
    idCeldaH3: '8966c6c74a3ffff',
    resolucionH3: 9,
    latitudCentroide: 2.439513,
    longitudCentroide: -76.600229,
  },
  {
    zonaManualId: 'ZONA-PANTEON-PROCERES',
    nombre: 'Panteón de los Próceres',
    descripcion: 'Mausoleo histórico de próceres y expresidentes oriundos de la región payanesa.',
    idCeldaH3: '8966c6c7413ffff',
    resolucionH3: 9,
    latitudCentroide: 2.442153,
    longitudCentroide: -76.608651,
  },
  {
    zonaManualId: 'ZONA-TERRA-PLAZA',
    nombre: 'Centro Comercial Terra Plaza',
    descripcion: 'Principal nodo de comercio moderno, servicios y entretenimiento del sector norte de Popayán.',
    idCeldaH3: '8966c6d5d8bffff',
    resolucionH3: 9,
    latitudCentroide: 2.485945,
    longitudCentroide: -76.563997,
  },
  {
    zonaManualId: 'ZONA-CAMPUS-TULCAN',
    nombre: 'Campus Tulcán (Unicauca)',
    descripcion: 'Sede universitaria principal de la Universidad del Cauca con gran afluencia estudiantil.',
    idCeldaH3: '8966c6c7497ffff',
    resolucionH3: 9,
    latitudCentroide: 2.447948,
    longitudCentroide: -76.602315,
  },
  {
    zonaManualId: 'ZONA-BELLA-VISTA',
    nombre: 'Sector de Bella Vista',
    descripcion: 'Sector residencial y de servicios en la zona norte de expansión urbana.',
    idCeldaH3: '8966c6d5aafffff',
    resolucionH3: 9,
    latitudCentroide: 2.458939,
    longitudCentroide: -76.598374,
  },
  {
    zonaManualId: 'ZONA-VILLA-OLIMPICA',
    nombre: 'Villa Olímpica',
    descripcion: 'Complejo deportivo y recreativo central de Popayán.',
    idCeldaH3: '8966c6d587bffff',
    resolucionH3: 9,
    latitudCentroide: 2.464733,
    longitudCentroide: -76.592039,
  },
  {
    zonaManualId: 'ZONA-RINCON-PAYANES',
    nombre: 'Rincón Payanés (Pueblito Patojo)',
    descripcion: 'Parque temático y turístico que reproduce los monumentos y arquitectura de Popayán.',
    idCeldaH3: '8966c6c7487ffff',
    resolucionH3: 9,
    latitudCentroide: 2.444710,
    longitudCentroide: -76.602624,
  },
  {
    zonaManualId: 'ZONA-YANACONAS',
    nombre: 'Sector Calicanto / Yanaconas',
    descripcion: 'Área tradicional de transición ecológica y senderismo hacia los cerros orientales.',
    idCeldaH3: '8966c6d5b07ffff',
    resolucionH3: 9,
    latitudCentroide: 2.445906,
    longitudCentroide: -76.585162,
  },
  {
    zonaManualId: 'ZONA-PARQUE-SALUD',
    nombre: 'Parque de la Salud (Los Hoyos)',
    descripcion: 'Zona verde y sendero ecológico urbano para el deporte y bienestar ciudadano.',
    idCeldaH3: '8966c6c749bffff',
    resolucionH3: 9,
    latitudCentroide: 2.448628,
    longitudCentroide: -76.608033,
  },
  {
    zonaManualId: 'ZONA-LA-ESMERALDA',
    nombre: 'Galería La Esmeralda',
    descripcion: 'Principal plaza de mercado y comercio popular tradicional del suroccidente payanés.',
    idCeldaH3: '8966c6c745bffff',
    resolucionH3: 9,
    latitudCentroide: 2.440275,
    longitudCentroide: -76.620397,
  },
  {
    zonaManualId: 'ZONA-EL-EMPEDRADO',
    nombre: 'Sector El Empedrado',
    descripcion: 'Barrio tradicional colonial de calles empedradas y arquitectura típica del sur histórico.',
    idCeldaH3: '8966c6c7407ffff',
    resolucionH3: 9,
    latitudCentroide: 2.436955,
    longitudCentroide: -76.606256,
  },
  {
    zonaManualId: 'ZONA-CAMPANARIO',
    nombre: 'Centro Comercial Campanario',
    descripcion: 'Emblemático centro comercial y punto de encuentro neurálgico del norte de Popayán.',
    idCeldaH3: '8966c6d5bd3ffff',
    resolucionH3: 9,
    latitudCentroide: 2.458258,
    longitudCentroide: -76.592657,
  },
];

/**
 * Consulta el catálogo oficial de emociones predeterminadas desde la base de datos (HU-01, HU-12).
 * Utiliza fallback local seguro en caso de contingencia de conectividad.
 */
export async function obtenerCatalogoEmociones(): Promise<DefinicionEmocion[]> {
  try {
    const urlApi = obtenerUrlBaseEmociones();
    const respuesta = await fetch(`${urlApi}/catalogo`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      if (Array.isArray(datos) && datos.length > 0) {
        return datos.map((item: any) => ({
          id: item.id,
          etiqueta: item.etiquetaVisible || item.id,
          colorPrincipal: item.codigoHexColor || '#10B981',
          colorFondoCirculo: item.codigoHexFondo || '#D1FAE5',
          simboloFacial: item.iconoSvg || '😊',
          descripcion: item.descripcion || '',
        }));
      }
    }
  } catch (err) {
    console.warn('No se pudo obtener el catálogo de emociones de la BD, usando fallback:', err);
  }
  return LISTA_EMOCIONES;
}

/**
 * Consulta el catálogo de zonas predeterminadas desde la base de datos (HU-04, HU-13).
 * Utiliza fallback local seguro en caso de contingencia de conectividad.
 */
export async function obtenerCatalogoZonas(): Promise<ElementoCatalogoZona[]> {
  try {
    const urlApi = obtenerUrlBaseGeo();
    const respuesta = await fetch(`${urlApi}/zonas-manuales`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      if (Array.isArray(datos) && datos.length > 0) {
        return datos as ElementoCatalogoZona[];
      }
    }
  } catch (err) {
    console.warn('No se pudo obtener el catálogo de zonas de la BD, usando fallback:', err);
  }
  return LISTA_ZONAS_PREDETERMINADAS;
}

/**
 * Envía la selección de emoción anónima al servidor backend (HU-01 y HU-04).
 * Soporta tanto coordenadas GPS como zona manual seleccionada.
 * Garantiza respuesta inmediata (< 1000 ms).
 */
export async function enviarSeleccionEmocion(
  idEmocion: DefinicionEmocion['id'],
  opcionesUbicacion?: {
    zonaManualId?: string;
    latitud?: number;
    longitud?: number;
  }
): Promise<RespuestaRegistroEmocion> {
  const token = obtenerTokenSesionTemporal();
  const urlApi = obtenerUrlBaseEmociones();

  // Si hay coordenadas GPS válidas se envían; de lo contrario se envía zona manual
  const cuerpoPeticion: SolicitudRegistroEmocion = {
    emocion: idEmocion,
    tokenSesionTemporal: token,
  };

  if (
    opcionesUbicacion?.latitud !== undefined &&
    opcionesUbicacion?.longitud !== undefined
  ) {
    cuerpoPeticion.latitud = opcionesUbicacion.latitud;
    cuerpoPeticion.longitud = opcionesUbicacion.longitud;
  } else {
    cuerpoPeticion.zonaManualId = opcionesUbicacion?.zonaManualId || 'ZONA-PARQUE-CALDAS';
  }

  const respuesta = await fetch(`${urlApi}/seleccionar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    const error: ErrorRegistroEmocion = {
      codigoEstado: respuesta.status,
      error: datos.error || 'ERROR_REGISTRO',
      mensaje: datos.mensaje || 'No fue posible registrar tu emoción.',
      segundosRestantes: datos.detallesAdicionales?.segundosRestantes,
    };
    throw error;
  }

  return datos as RespuestaRegistroEmocion;
}

/**
 * Envía la indicación de intensidad asociada al evento de emoción (HU-02).
 * Respeta la inmutabilidad y garantiza respuesta en menos de 300 ms (RNF Desempeño).
 */
export async function enviarRegistroIntensidad(
  idEvento: string,
  nivelIntensidad: number
): Promise<RespuestaRegistroIntensidad> {
  const urlApi = obtenerUrlBaseEmociones();

  const cuerpoPeticion: SolicitudRegistroIntensidad = {
    idEvento,
    nivelIntensidad,
  };

  const respuesta = await fetch(`${urlApi}/intensidad`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    const error: ErrorRegistroEmocion = {
      codigoEstado: respuesta.status,
      error: datos.error || 'ERROR_INTENSIDAD',
      mensaje: datos.mensaje || 'No fue posible registrar la intensidad de la emoción.',
    };
    throw error;
  }

  return datos as RespuestaRegistroIntensidad;
}

/**
 * Envía el comentario complementario y opcional de una emoción previamente seleccionada (HU-03).
 * Tiempo de respuesta garantizado < 300 ms bajo condiciones normales (RNF Desempeño).
 */
export async function enviarRegistroComentario(
  idEvento: string,
  comentario: string
): Promise<RespuestaRegistroComentario> {
  const urlApi = obtenerUrlBaseEmociones();

  const cuerpoPeticion: SolicitudRegistroComentario = {
    idEvento,
    comentario,
  };

  const respuesta = await fetch(`${urlApi}/comentario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    const error: ErrorRegistroEmocion = {
      codigoEstado: respuesta.status,
      error: datos.error || 'ERROR_COMENTARIO',
      mensaje: datos.mensaje || 'No fue posible registrar el comentario de la emoción.',
    };
    throw error;
  }

  return datos as RespuestaRegistroComentario;
}
