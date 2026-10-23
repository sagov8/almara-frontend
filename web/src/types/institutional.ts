export type SectorActividad = 'GOBIERNO' | 'EDUCACION' | 'EVENTOS' | 'PRIVADO';

export type EstadoCuentaInstitucional = 'PENDIENTE_APROBACION' | 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA';

export interface RegistroInstitucionalSolicitud {
  razonSocial: string;
  identificacionFiscalNit: string;
  nombreContacto: string;
  correoCorporativo: string;
  password: string;
  telefonoContacto?: string;
  sectorActividad?: SectorActividad;
}

export interface RegistroInstitucionalRespuesta {
  idInstitucion: string;
  razonSocial: string;
  correoCorporativo: string;
  estadoCuenta: EstadoCuentaInstitucional;
  correoVerificado: boolean;
  tokenVerificacionSimulado?: string;
  mensaje: string;
}

export interface VerificacionCorreoSolicitud {
  tokenVerificacion: string;
}

export interface VerificacionCorreoRespuesta {
  idInstitucion: string;
  razonSocial: string;
  correoCorporativo: string;
  estadoCuenta: EstadoCuentaInstitucional;
  correoVerificado: boolean;
  idSuscripcion: string;
  codigoPlan: string;
  fechaExpiracionSuscripcion: string;
  mensaje: string;
}

export interface ErrorApi {
  codigoEstado: number;
  error: string;
  mensaje: string;
  ruta?: string;
  detallesAdicionales?: Record<string, unknown>;
}
