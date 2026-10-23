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

export interface LoginInstitucionalSolicitud {
  correoInstitucional: string;
  password: string;
}

export interface LoginInstitucionalRespuesta {
  tokenAcceso: string;
  tipoToken: string;
  expiraEnSegundos: number;
  idInstitucion: string;
  razonSocial: string;
  correoInstitucional: string;
  rol: string;
  codigoPlan: string;
  nombrePlan: string;
  estadoSuscripcion: string;
  modulosHabilitados: string[];
  requiereRenovacion: boolean;
  rutaRedireccion: string;
}

export interface ErrorApi {
  codigoEstado: number;
  error: string;
  mensaje: string;
  ruta?: string;
  detallesAdicionales?: Record<string, unknown>;
}

export interface LogoutInstitucionalRespuesta {
  mensaje: string;
  tokenRevocado: boolean;
  marcaTemporal: string;
}

export interface SesionActualRespuesta {
  idInstitucion: string;
  correoInstitucional: string;
  razonSocial: string;
  rol: string;
  codigoPlan: string;
  estadoSuscripcion: string;
  expiraEnSegundosRestantes: number;
  activo: boolean;
}
