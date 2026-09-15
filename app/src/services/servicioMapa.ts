import { obtenerUrlBase } from './servicioEmocion';

export interface CoordenadasGps {
  latitud: number;
  longitud: number;
}

export interface CeldaMapaEmocional {
  idCeldaH3: string;
  resolucionH3: number;
  latitudCentroide: number;
  longitudCentroide: number;
  verticesHexagono: CoordenadasGps[];
  emocionPredominante?: string;
  nombreEmocion: string;
  codigoHexColor: string;
  codigoHexFondo: string;
  icono: string;
  totalReportes: number;
  cumpleUmbral: boolean;
  nombreZona: string;
  descripcionProteccion: string;
}

export interface ConsultaMapaEmocionalRespuesta {
  celdasVisibles: CeldaMapaEmocional[];
  totalCeldasVisibles: number;
  totalReportesEnMapa: number;
  umbralMinimoAplicado: number;
  resolucionH3Utilizada: number;
  mensajeProteccionComunidad: string;
  tiempoCalculoMs: number;
}

export interface FiltroBoundingBox {
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
}

export interface DetalleZonaEmocionRespuesta {
  idCeldaH3: string;
  nombreZona: string;
  emocionPredominante?: string;
  nombreEmocion: string;
  codigoHexColor: string;
  codigoHexFondo: string;
  icono: string;
  distribucionPorcentajes: Record<string, number>;
  tendencia: string;
  participantesAproximados: string;
  periodoTemporal: string;
  comentariosRecientes: string[];
  cumpleUmbral: boolean;
  descripcionProteccion: string;
  tiempoCalculoMs: number;
}

/**
 * Consulta la capa emocional agregada para el mapa interactivo de Popayán (HU-05).
 */
export async function consultarMapaPopayan(
  zoom: number = 14,
  umbralK: number = 5
): Promise<ConsultaMapaEmocionalRespuesta> {
  const url = `${obtenerUrlBase()}/mapa/popayan?zoom=${zoom}&umbralK=${umbralK}`;

  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error al consultar mapa de Popayán: ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.warn('Fallo al conectar con el servidor para el mapa, usando datos locales de respaldo:', error);
    return generarDatosRespaldoPopayan(zoom, umbralK);
  }
}

/**
 * Consulta celdas en cualquier área y zoom con soporte para estrategia espacial (HU-05).
 */
export async function consultarCeldasMapa(
  zoom: number = 14,
  umbralK: number = 5,
  bbox?: FiltroBoundingBox
): Promise<ConsultaMapaEmocionalRespuesta> {
  let url = `${obtenerUrlBase()}/mapa/celdas?zoom=${zoom}&umbralK=${umbralK}`;
  if (bbox) {
    if (bbox.minLat !== undefined) url += `&minLat=${bbox.minLat}`;
    if (bbox.maxLat !== undefined) url += `&maxLat=${bbox.maxLat}`;
    if (bbox.minLon !== undefined) url += `&minLon=${bbox.minLon}`;
    if (bbox.maxLon !== undefined) url += `&maxLon=${bbox.maxLon}`;
  }

  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error en API de mapa: ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.warn('Usando datos de respaldo para celdas del mapa:', error);
    return generarDatosRespaldoPopayan(zoom, umbralK);
  }
}

/**
 * Consulta todas las celdas incluyendo las que están en reserva ciudadana con candado.
 */
export async function consultarTodasLasCeldas(
  zoom: number = 14,
  umbralK: number = 5
): Promise<CeldaMapaEmocional[]> {
  const url = `${obtenerUrlBase()}/mapa/todas-celdas?zoom=${zoom}&umbralK=${umbralK}`;

  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error al consultar celdas: ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.warn('Error al obtener todas las celdas:', error);
    const respaldo = generarDatosRespaldoPopayan(zoom, umbralK);
    return respaldo.celdasVisibles;
  }
}

/**
 * Consulta la distribución emocional detallada de una celda seleccionada (HU-06).
 */
export async function consultarDetalleZona(
  idCeldaH3: string,
  periodo: string = 'ULTIMAS_2_HORAS'
): Promise<DetalleZonaEmocionRespuesta> {
  const url = `${obtenerUrlBase()}/mapa/zona/${idCeldaH3}/detalle?periodo=${periodo}`;

  try {
    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error al consultar detalle de zona: ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.warn('Usando datos de respaldo para detalle de zona:', error);
    return generarDetalleRespaldo(idCeldaH3, periodo);
  }
}

function generarDetalleRespaldo(idCeldaH3: string, periodo: string): DetalleZonaEmocionRespuesta {
  return {
    idCeldaH3,
    nombreZona: 'Popayán Centro',
    emocionPredominante: 'FELICIDAD',
    nombreEmocion: 'Felicidad',
    codigoHexColor: '#10B981',
    codigoHexFondo: '#D1FAE5',
    icono: '😊',
    distribucionPorcentajes: {
      FELICIDAD: 60,
      NEUTRALIDAD: 25,
      PREOCUPACION: 10,
      ANSIEDAD: 5,
    },
    tendencia: 'Clima favorable y positivo en la zona',
    participantesAproximados: 'Más de 10 vecinos',
    periodoTemporal: periodo === 'ULTIMAS_24_HORAS' ? 'Últimas 24 horas' : 'Últimas 2 horas',
    comentariosRecientes: [
      'Ambiente agradable y tranquilo en el sector.',
      'Excelente jornada comunitaria hoy.',
    ],
    cumpleUmbral: true,
    descripcionProteccion: 'Protección en Comunidad activa: Más de 10 vecinos han compartido su sentir aquí.',
    tiempoCalculoMs: 5,
  };
}

/**
 * Datos de respaldo para Popayán en caso de contingencia offline.
 */
function generarDatosRespaldoPopayan(zoom: number, umbralK: number): ConsultaMapaEmocionalRespuesta {
  const celdasMock: CeldaMapaEmocional[] = [
    {
      idCeldaH3: '8966c6c748fffff',
      resolucionH3: 9,
      latitudCentroide: 2.443431,
      longitudCentroide: -76.605638,
      verticesHexagono: [
        { latitud: 2.4442, longitud: -76.6056 },
        { latitud: 2.4438, longitud: -76.6048 },
        { latitud: 2.4430, longitud: -76.6048 },
        { latitud: 2.4426, longitud: -76.6056 },
        { latitud: 2.4430, longitud: -76.6064 },
        { latitud: 2.4438, longitud: -76.6064 },
      ],
      emocionPredominante: 'FELICIDAD',
      nombreEmocion: 'Felicidad',
      codigoHexColor: '#10B981',
      codigoHexFondo: 'rgba(16, 185, 129, 0.45)',
      icono: '😊',
      totalReportes: 12,
      cumpleUmbral: true,
      nombreZona: 'Parque Caldas',
      descripcionProteccion: 'Protección en Comunidad: 12 vecinos han compartido su sentir aquí de forma anónima.',
    },
    {
      idCeldaH3: '8966c6c7483ffff',
      resolucionH3: 9,
      latitudCentroide: 2.446669,
      longitudCentroide: -76.605328,
      verticesHexagono: [
        { latitud: 2.4474, longitud: -76.6053 },
        { latitud: 2.4470, longitud: -76.6045 },
        { latitud: 2.4462, longitud: -76.6045 },
        { latitud: 2.4458, longitud: -76.6053 },
        { latitud: 2.4462, longitud: -76.6061 },
        { latitud: 2.4470, longitud: -76.6061 },
      ],
      emocionPredominante: 'FELICIDAD',
      nombreEmocion: 'Felicidad',
      codigoHexColor: '#10B981',
      codigoHexFondo: 'rgba(16, 185, 129, 0.45)',
      icono: '😊',
      totalReportes: 8,
      cumpleUmbral: true,
      nombreZona: 'Puente del Humilladero',
      descripcionProteccion: 'Protección en Comunidad: 8 vecinos han compartido su sentir aquí de forma anónima.',
    },
    {
      idCeldaH3: '8966c6d5b4bffff',
      resolucionH3: 9,
      latitudCentroide: 2.445989,
      longitudCentroide: -76.599611,
      verticesHexagono: [
        { latitud: 2.4467, longitud: -76.5996 },
        { latitud: 2.4463, longitud: -76.5988 },
        { latitud: 2.4455, longitud: -76.5988 },
        { latitud: 2.4451, longitud: -76.5996 },
        { latitud: 2.4455, longitud: -76.6004 },
        { latitud: 2.4463, longitud: -76.6004 },
      ],
      emocionPredominante: 'FELICIDAD',
      nombreEmocion: 'Felicidad',
      codigoHexColor: '#10B981',
      codigoHexFondo: 'rgba(16, 185, 129, 0.45)',
      icono: '😊',
      totalReportes: 9,
      cumpleUmbral: true,
      nombreZona: 'El Morro de Tulcán',
      descripcionProteccion: 'Protección en Comunidad: 9 vecinos han compartido su sentir aquí de forma anónima.',
    },
    {
      idCeldaH3: '8966c6d5bd3ffff',
      resolucionH3: 9,
      latitudCentroide: 2.458258,
      longitudCentroide: -76.592657,
      verticesHexagono: [
        { latitud: 2.4590, longitud: -76.5926 },
        { latitud: 2.4586, longitud: -76.5918 },
        { latitud: 2.4578, longitud: -76.5918 },
        { latitud: 2.4574, longitud: -76.5926 },
        { latitud: 2.4578, longitud: -76.5934 },
        { latitud: 2.4586, longitud: -76.5934 },
      ],
      emocionPredominante: 'NEUTRALIDAD',
      nombreEmocion: 'Neutralidad',
      codigoHexColor: '#F59E0B',
      codigoHexFondo: 'rgba(245, 158, 11, 0.45)',
      icono: '😐',
      totalReportes: 7,
      cumpleUmbral: true,
      nombreZona: 'Centro Comercial Campanario',
      descripcionProteccion: 'Protección en Comunidad: 7 vecinos han compartido su sentir aquí de forma anónima.',
    },
  ];

  return {
    celdasVisibles: celdasMock,
    totalCeldasVisibles: celdasMock.length,
    totalReportesEnMapa: 36,
    umbralMinimoAplicado: umbralK,
    resolucionH3Utilizada: zoom >= 14 ? 9 : zoom >= 11 ? 8 : 7,
    mensajeProteccionComunidad:
      'Protección en Comunidad: Para cuidar tu privacidad, las zonas solo se colorean en el mapa cuando al menos 5 vecinos han compartido su sentir. Tu participación es anónima.',
    tiempoCalculoMs: 15,
  };
}
