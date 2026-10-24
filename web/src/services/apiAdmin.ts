/**
 * Servicio de comunicación HTTP para el Módulo de Administración de Almara (HU-11 a HU-15, HU-18).
 */

import {
  CrearEmocionSolicitud,
  EmocionAdmin,
  ErrorApiAdmin,
  LoginAdminRespuesta,
  LoginAdminSolicitud,
  LogoutAdminRespuesta,
  ModificarEmocionSolicitud,
  SesionAdminRespuesta,
} from '../types/admin';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const ADMIN_AUTH_ENDPOINT = `${BASE_URL}/api/v1/admin/auth`;
const ADMIN_EMOCIONES_ENDPOINT = `${BASE_URL}/api/v1/admin/emociones`;

// ----------------------------------------------------------------------------
// Autenticación de Administrador (HU-11, HU-18)
// ----------------------------------------------------------------------------

export async function loginAdmin(
  solicitud: LoginAdminSolicitud
): Promise<LoginAdminRespuesta> {
  const response = await fetch(`${ADMIN_AUTH_ENDPOINT}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_DESCONOCIDO',
      mensaje: 'Error de comunicación con el servidor',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function obtenerSesionAdmin(
  token: string
): Promise<SesionAdminRespuesta> {
  const response = await fetch(`${ADMIN_AUTH_ENDPOINT}/sesion-actual`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_SESION',
      mensaje: 'La sesión no es válida o ha caducado',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function logoutAdmin(token: string): Promise<LogoutAdminRespuesta> {
  const response = await fetch(`${ADMIN_AUTH_ENDPOINT}/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_LOGOUT',
      mensaje: 'No fue posible cerrar la sesión en el servidor',
    }));
    throw errorBody;
  }

  return response.json();
}

// ----------------------------------------------------------------------------
// Gestión del Catálogo de Emociones (HU-12)
// ----------------------------------------------------------------------------

export async function listarEmocionesAdmin(token: string): Promise<EmocionAdmin[]> {
  const response = await fetch(ADMIN_EMOCIONES_ENDPOINT, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_LISTAR_EMOCIONES',
      mensaje: 'Error al consultar las emociones del catálogo',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function agregarEmocionAdmin(
  token: string,
  solicitud: CrearEmocionSolicitud
): Promise<EmocionAdmin> {
  const response = await fetch(ADMIN_EMOCIONES_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_AGREGAR_EMOCION',
      mensaje: 'Error al agregar la nueva emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function modificarEmocionAdmin(
  token: string,
  idEmocion: string,
  solicitud: ModificarEmocionSolicitud
): Promise<EmocionAdmin> {
  const response = await fetch(`${ADMIN_EMOCIONES_ENDPOINT}/${encodeURIComponent(idEmocion)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud),
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_MODIFICAR_EMOCION',
      mensaje: 'Error al actualizar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function desactivarEmocionAdmin(
  token: string,
  idEmocion: string
): Promise<EmocionAdmin> {
  const response = await fetch(`${ADMIN_EMOCIONES_ENDPOINT}/${encodeURIComponent(idEmocion)}/desactivar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_DESACTIVAR_EMOCION',
      mensaje: 'Error al desactivar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function activarEmocionAdmin(
  token: string,
  idEmocion: string
): Promise<EmocionAdmin> {
  const response = await fetch(`${ADMIN_EMOCIONES_ENDPOINT}/${encodeURIComponent(idEmocion)}/activar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_ACTIVAR_EMOCION',
      mensaje: 'Error al reactivar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}
