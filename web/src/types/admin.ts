/**
 * Tipos e interfaces de datos para el Módulo de Administración de Almara (HU-11 a HU-15, HU-18).
 */

export interface LoginAdminSolicitud {
  usuarioAdmin: string;
  passwordAdmin: string;
}

export interface LoginAdminRespuesta {
  token: string;
  tipoToken: string;
  idAdmin: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  expiraEnSegundos: number;
}

export interface SesionAdminRespuesta {
  autenticado: boolean;
  idAdmin: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  expiraEnSegundos: number;
}

export interface LogoutAdminRespuesta {
  exitoso: boolean;
  mensaje: string;
}

export interface ErrorApiAdmin {
  codigoEstado: number;
  error: string;
  mensaje: string;
  detallesAdicionales?: Record<string, string>;
}

/**
 * Representación de una emoción en el panel de administración (HU-12).
 */
export interface EmocionAdmin {
  idEmocion: string;
  nombreEtiqueta: string;
  codigoHexColor: string;
  codigoHexFondo: string;
  iconoSvg: string;
  descripcion: string;
  activo: boolean;
  totalReportesAsociados: number;
  fechaCreacion?: string;
}

export interface CrearEmocionSolicitud {
  idEmocion: string;
  nombreEtiqueta: string;
  codigoHexColor: string;
  codigoHexFondo?: string;
  iconoSvg: string;
  descripcion?: string;
}

export interface ModificarEmocionSolicitud {
  nombreEtiqueta: string;
  codigoHexColor: string;
  codigoHexFondo?: string;
  iconoSvg: string;
  descripcion?: string;
}
