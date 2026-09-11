import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DefinicionEmocion } from '../constants/emociones';
import { obtenerTokenSesionTemporal } from './servicioSesion';

/**
 * Resuelve dinámicamente la URL base del backend de acuerdo con el entorno de ejecución:
 * - En navegador Web: http://localhost:8080
 * - En dispositivo móvil físico con Expo Go: Detecta la IP del host de Metro (ej. 192.168.1.77)
 * - Fallback para red local: http://192.168.1.77:8080
 */
export function obtenerUrlBaseApi(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1/emociones';
  }

  // Extraer la IP local del equipo de desarrollo desde la configuración de Expo
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ipHost = hostUri.split(':')[0];
    if (ipHost && ipHost !== 'localhost' && ipHost !== '127.0.0.1') {
      return `http://${ipHost}:8080/api/v1/emociones`;
    }
  }

  // IP local de tu computador en la red Wi-Fi
  return 'http://192.168.1.77:8080/api/v1/emociones';
}

export interface SolicitudRegistroEmocion {
  emocion: DefinicionEmocion['id'];
  tokenSesionTemporal: string;
}

export interface RespuestaRegistroEmocion {
  idEvento: string;
  mensaje: string;
  emocionRegistrada: string;
  fechaHoraEnvio: string;
  segundosBloqueo: number;
}

export interface ErrorRegistroEmocion {
  codigoEstado: number;
  error: string;
  mensaje: string;
  segundosRestantes?: number;
}

/**
 * Envía la selección de emoción anónima al servidor backend.
 * Garantiza respuesta inmediata (< 1000 ms).
 */
export async function enviarSeleccionEmocion(
  idEmocion: DefinicionEmocion['id']
): Promise<RespuestaRegistroEmocion> {
  const token = obtenerTokenSesionTemporal();
  const urlApi = obtenerUrlBaseApi();

  const cuerpoPeticion: SolicitudRegistroEmocion = {
    emocion: idEmocion,
    tokenSesionTemporal: token,
  };

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
