import {
  RegistroInstitucionalSolicitud,
  RegistroInstitucionalRespuesta,
  VerificacionCorreoSolicitud,
  VerificacionCorreoRespuesta,
  ErrorApi,
} from '../types/institutional';

const API_BASE_URL = '/api/v1/institutional/auth';

async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    let errorApi: ErrorApi;
    try {
      errorApi = await respuesta.json();
    } catch {
      errorApi = {
        codigoEstado: respuesta.status,
        error: 'ERROR_RED',
        mensaje: 'No fue posible comunicarse con el servidor.',
      };
    }
    throw errorApi;
  }
  return respuesta.json();
}

export async function registrarInstitucion(
  solicitud: RegistroInstitucionalSolicitud
): Promise<RegistroInstitucionalRespuesta> {
  const respuesta = await fetch(`${API_BASE_URL}/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });
  return manejarRespuesta<RegistroInstitucionalRespuesta>(respuesta);
}

export async function verificarCorreoInstitucion(
  solicitud: VerificacionCorreoSolicitud
): Promise<VerificacionCorreoRespuesta> {
  const respuesta = await fetch(`${API_BASE_URL}/verificar-correo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });
  return manejarRespuesta<VerificacionCorreoRespuesta>(respuesta);
}
