/**
 * Servicio de comunicación HTTP para el Módulo de Administración de Almara.
 */

import {
  ActualizarResolucionH3Solicitud,
  ActualizarUmbralMapaSolicitud,
  AprobarInstitucionSolicitud,
  ConfiguracionEspacialH3,
  ConfiguracionUmbralMapa,
  CrearEmocionSolicitud,
  CrearPoligonoUrbanoSolicitud,
  DarDeBajaInstitucionSolicitud,
  EmocionAdmin,
  ErrorApiAdmin,
  InstitucionAdminResumen,
  LoginAdminRespuesta,
  LoginAdminSolicitud,
  LogoutAdminRespuesta,
  ModificarEmocionSolicitud,
  ModificarPoligonoUrbanoSolicitud,
  PlanAdminResumen,
  PoligonoUrbano,
  ReactivarInstitucionSolicitud,
  RevocarSesionesSolicitud,
  SesionAdminRespuesta,
  SuspenderInstitucionSolicitud,
} from '../types/admin';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
const ADMIN_AUTH_ENDPOINT = `${BASE_URL}/api/v1/admin/auth`;
const ADMIN_EMOCIONES_ENDPOINT = `${BASE_URL}/api/v1/admin/emociones`;
const ADMIN_UMBRALES_ENDPOINT = `${BASE_URL}/api/v1/admin/mapa/umbrales`;
const ADMIN_GEO_ENDPOINT = `${BASE_URL}/api/v1/admin/geo`;
const ADMIN_INSTITUCIONES_ENDPOINT = `${BASE_URL}/api/v1/admin/instituciones`;

// ----------------------------------------------------------------------------
// Autenticación de Administrador
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
// Catálogo de Emociones Predeterminadas
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
      mensaje: 'No fue posible consultar el catálogo de emociones',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function crearEmocionAdmin(
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
      error: 'ERROR_CREAR_EMOCION',
      mensaje: 'No fue posible agregar la emoción',
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
      mensaje: 'No fue posible actualizar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function desactivarEmocionAdmin(
  token: string,
  idEmocion: string
): Promise<EmocionAdmin> {
  const response = await fetch(`${ADMIN_EMOCIONES_ENDPOINT}/${encodeURIComponent(idEmocion)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_DESACTIVAR_EMOCION',
      mensaje: 'No fue posible desactivar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

export async function reactivarEmocionAdmin(
  token: string,
  idEmocion: string
): Promise<EmocionAdmin> {
  const response = await fetch(`${ADMIN_EMOCIONES_ENDPOINT}/${encodeURIComponent(idEmocion)}/reactivar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_REACTIVAR_EMOCION',
      mensaje: 'No fue posible reactivar la emoción',
    }));
    throw errorBody;
  }

  return response.json();
}

// Alias para compatibilidad de nomenclatura en vistas
export const agregarEmocionAdmin = crearEmocionAdmin;
export const activarEmocionAdmin = reactivarEmocionAdmin;

// ----------------------------------------------------------------------------
// Umbrales de Privacidad del Mapa
// ----------------------------------------------------------------------------

export async function obtenerConfiguracionUmbralesAdmin(
  token: string
): Promise<ConfiguracionUmbralMapa> {
  const response = await fetch(ADMIN_UMBRALES_ENDPOINT, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_OBTENER_UMBRAL',
      mensaje: `Error ${response.status}: No se pudo consultar la configuración de umbrales del mapa.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function actualizarConfiguracionUmbralesAdmin(
  token: string,
  solicitud: ActualizarUmbralMapaSolicitud
): Promise<ConfiguracionUmbralMapa> {
  const response = await fetch(ADMIN_UMBRALES_ENDPOINT, {
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
      error: 'ERROR_ACTUALIZAR_UMBRAL',
      mensaje: `Error ${response.status}: No se pudo actualizar el umbral del mapa.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function restablecerUmbralesAdmin(
  token: string,
  justificacion?: string
): Promise<ConfiguracionUmbralMapa> {
  const query = justificacion ? `?justificacion=${encodeURIComponent(justificacion)}` : '';
  const response = await fetch(`${ADMIN_UMBRALES_ENDPOINT}/restablecer-defecto${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_RESTABLECER_UMBRAL',
      mensaje: `Error ${response.status}: No se pudo restablecer el umbral del mapa.`,
    }));
    throw errorBody;
  }

  return response.json();
}

// ----------------------------------------------------------------------------
// Zonas Geográficas H3 y Polígonos PostGIS
// ----------------------------------------------------------------------------

export async function obtenerConfiguracionResolucionH3Admin(
  token: string
): Promise<ConfiguracionEspacialH3> {
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/resolucion`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_OBTENER_RESOLUCION_H3',
      mensaje: `Error ${response.status}: No se pudo consultar la resolución espacial H3.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function actualizarResolucionH3Admin(
  token: string,
  solicitud: ActualizarResolucionH3Solicitud
): Promise<ConfiguracionEspacialH3> {
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/resolucion`, {
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
      error: 'ERROR_ACTUALIZAR_RESOLUCION_H3',
      mensaje: `Error ${response.status}: No se pudo actualizar la resolución H3.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function listarPoligonosUrbanosAdmin(
  token: string,
  soloActivos: boolean = false
): Promise<PoligonoUrbano[]> {
  const query = soloActivos ? '?soloActivos=true' : '';
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/poligonos${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_LISTAR_POLIGONOS',
      mensaje: `Error ${response.status}: No se pudo listar los polígonos urbanos.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function crearPoligonoUrbanoAdmin(
  token: string,
  solicitud: CrearPoligonoUrbanoSolicitud
): Promise<PoligonoUrbano> {
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/poligonos`, {
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
      error: 'ERROR_CREAR_POLIGONO',
      mensaje: `Error ${response.status}: No se pudo registrar el polígono urbano.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function modificarPoligonoUrbanoAdmin(
  token: string,
  idZona: string,
  solicitud: ModificarPoligonoUrbanoSolicitud
): Promise<PoligonoUrbano> {
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/poligonos/${encodeURIComponent(idZona)}`, {
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
      error: 'ERROR_MODIFICAR_POLIGONO',
      mensaje: `Error ${response.status}: No se pudo actualizar el polígono urbano.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function desactivarPoligonoUrbanoAdmin(
  token: string,
  idZona: string,
  justificacion?: string
): Promise<PoligonoUrbano> {
  const query = justificacion ? `?justificacion=${encodeURIComponent(justificacion)}` : '';
  const response = await fetch(`${ADMIN_GEO_ENDPOINT}/poligonos/${encodeURIComponent(idZona)}${query}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_DESACTIVAR_POLIGONO',
      mensaje: `Error ${response.status}: No se pudo desactivar el polígono urbano.`,
    }));
    throw errorBody;
  }

  return response.json();
}

// ----------------------------------------------------------------------------
// Gestión de Usuarios Institucionales
// ----------------------------------------------------------------------------

export async function listarInstitucionesAdmin(
  token: string,
  estado?: string,
  busqueda?: string
): Promise<InstitucionAdminResumen[]> {
  const params = new URLSearchParams();
  if (estado && estado !== 'TODOS') params.append('estado', estado);
  if (busqueda && busqueda.trim()) params.append('busqueda', busqueda.trim());

  const qs = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}${qs}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_LISTAR_INSTITUCIONES',
      mensaje: `Error ${response.status}: No se pudo listar las instituciones.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function obtenerDetalleInstitucionAdmin(
  token: string,
  idInstitucion: string
): Promise<InstitucionAdminResumen> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_DETALLE_INSTITUCION',
      mensaje: `Error ${response.status}: No se pudo obtener el detalle de la institución.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function listarPlanesDisponiblesAdmin(
  token: string
): Promise<PlanAdminResumen[]> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/planes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_LISTAR_PLANES',
      mensaje: `Error ${response.status}: No se pudo listar los planes disponibles.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function aprobarInstitucionAdmin(
  token: string,
  idInstitucion: string,
  solicitud: AprobarInstitucionSolicitud
): Promise<InstitucionAdminResumen> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}/aprobar`, {
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
      error: 'ERROR_APROBAR_INSTITUCION',
      mensaje: `Error ${response.status}: No se pudo aprobar la institución.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function suspenderInstitucionAdmin(
  token: string,
  idInstitucion: string,
  solicitud: SuspenderInstitucionSolicitud
): Promise<InstitucionAdminResumen> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}/suspender`, {
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
      error: 'ERROR_SUSPENDER_INSTITUCION',
      mensaje: `Error ${response.status}: No se pudo suspender la institución.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function darDeBajaInstitucionAdmin(
  token: string,
  idInstitucion: string,
  solicitud: DarDeBajaInstitucionSolicitud
): Promise<InstitucionAdminResumen> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}/dar-de-baja`, {
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
      error: 'ERROR_BAJA_INSTITUCION',
      mensaje: `Error ${response.status}: No se pudo dar de baja la institución.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function reactivarInstitucionAdmin(
  token: string,
  idInstitucion: string,
  solicitud: ReactivarInstitucionSolicitud
): Promise<InstitucionAdminResumen> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}/reactivar`, {
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
      error: 'ERROR_REACTIVAR_INSTITUCION',
      mensaje: `Error ${response.status}: No se pudo reactivar la institución.`,
    }));
    throw errorBody;
  }

  return response.json();
}

export async function revocarSesionesInstitucionAdmin(
  token: string,
  idInstitucion: string,
  solicitud?: RevocarSesionesSolicitud
): Promise<{ mensaje: string; idInstitucion: string }> {
  const response = await fetch(`${ADMIN_INSTITUCIONES_ENDPOINT}/${encodeURIComponent(idInstitucion)}/revocar-sesiones`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(solicitud || {}),
  });

  if (!response.ok) {
    const errorBody: ErrorApiAdmin = await response.json().catch(() => ({
      codigoEstado: response.status,
      error: 'ERROR_REVOCAR_SESIONES',
      mensaje: `Error ${response.status}: No se pudo revocar las sesiones activas.`,
    }));
    throw errorBody;
  }

  return response.json();
}
