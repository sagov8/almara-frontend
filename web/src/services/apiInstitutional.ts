import {
  RegistroInstitucionalSolicitud,
  RegistroInstitucionalRespuesta,
  VerificacionCorreoSolicitud,
  VerificacionCorreoRespuesta,
  LoginInstitucionalSolicitud,
  LoginInstitucionalRespuesta,
  LogoutInstitucionalRespuesta,
  SesionActualRespuesta,
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

export async function iniciarSesionInstitucion(
  solicitud: LoginInstitucionalSolicitud
): Promise<LoginInstitucionalRespuesta> {
  const respuesta = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });
  return manejarRespuesta<LoginInstitucionalRespuesta>(respuesta);
}

export async function cerrarSesionInstitucion(
  tokenAcceso: string
): Promise<LogoutInstitucionalRespuesta> {
  const respuesta = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenAcceso}`,
    },
  });
  return manejarRespuesta<LogoutInstitucionalRespuesta>(respuesta);
}

export async function obtenerSesionActual(
  tokenAcceso: string
): Promise<SesionActualRespuesta> {
  const respuesta = await fetch(`${API_BASE_URL}/sesion-actual`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenAcceso}`,
    },
  });
  return manejarRespuesta<SesionActualRespuesta>(respuesta);
}

