import {
  RegistroInstitucionalSolicitud,
  RegistroInstitucionalRespuesta,
  VerificacionCorreoSolicitud,
  VerificacionCorreoRespuesta,
  LoginInstitucionalSolicitud,
  LoginInstitucionalRespuesta,
  LogoutInstitucionalRespuesta,
  SesionActualRespuesta,
  CatalogoPlanesRespuesta,
  EstadoSuscripcionRespuesta,
  AdquirirPlanSolicitud,
  OrdenSuscripcionRespuesta,
  ErrorApi,
} from '../types/institutional';

const API_AUTH_URL = '/api/v1/institutional/auth';
const API_PLANES_URL = '/api/v1/institutional/planes';
const API_SUSCRIPCIONES_URL = '/api/v1/institutional/suscripciones';
const API_CHECKOUT_URL = '/api/v1/institutional/checkout';

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
  const respuesta = await fetch(`${API_AUTH_URL}/registro`, {
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
  const respuesta = await fetch(`${API_AUTH_URL}/verificar-correo`, {
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
  const respuesta = await fetch(`${API_AUTH_URL}/login`, {
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
  const respuesta = await fetch(`${API_AUTH_URL}/logout`, {
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
  const respuesta = await fetch(`${API_AUTH_URL}/sesion-actual`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenAcceso}`,
    },
  });
  return manejarRespuesta<SesionActualRespuesta>(respuesta);
}

export async function consultarCatalogoPlanes(
  tokenAcceso?: string
): Promise<CatalogoPlanesRespuesta> {
  const headers: Record<string, string> = {};
  if (tokenAcceso) {
    headers['Authorization'] = `Bearer ${tokenAcceso}`;
  }
  const respuesta = await fetch(`${API_PLANES_URL}/catalogo`, {
    method: 'GET',
    headers,
  });
  return manejarRespuesta<CatalogoPlanesRespuesta>(respuesta);
}

export async function consultarMiEstadoSuscripcion(
  tokenAcceso: string
): Promise<EstadoSuscripcionRespuesta> {
  const respuesta = await fetch(`${API_SUSCRIPCIONES_URL}/mi-estado`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenAcceso}`,
    },
  });
  return manejarRespuesta<EstadoSuscripcionRespuesta>(respuesta);
}

export async function adquirirPlanYCrearOrden(
  solicitud: AdquirirPlanSolicitud,
  tokenAcceso: string
): Promise<OrdenSuscripcionRespuesta> {
  const respuesta = await fetch(`${API_CHECKOUT_URL}/orden`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenAcceso}`,
    },
    body: JSON.stringify(solicitud),
  });
  return manejarRespuesta<OrdenSuscripcionRespuesta>(respuesta);
}

export async function consultarOrdenPorId(
  idOrden: string,
  tokenAcceso: string
): Promise<OrdenSuscripcionRespuesta> {
  const respuesta = await fetch(`${API_CHECKOUT_URL}/ordenes/${idOrden}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenAcceso}`,
    },
  });
  return manejarRespuesta<OrdenSuscripcionRespuesta>(respuesta);
}


