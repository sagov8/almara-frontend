/**
 * Tipos e interfaces de datos para el Módulo de Administración de Almara.
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
 * Representación de una emoción en el panel de administración.
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

/**
 * Parámetros y reglas de privacidad de k-anonimato del mapa.
 */
export interface ConfiguracionUmbralMapa {
  id: string;
  umbralMinimoK: number;
  tiempoRecalculoSegundos: number;
  modoEstricto: boolean;
  mensajeProteccion: string;
  fechaActualizacion: string;
  actualizadoPor: string;
  minimoTecnicoPermitidoK: number;
}

export interface ActualizarUmbralMapaSolicitud {
  umbralMinimoK: number;
  tiempoRecalculoSegundos: number;
  modoEstricto?: boolean;
  mensajeProteccion: string;
  justificacionAuditoria: string;
}

/**
 * Tipos para la gestión de resolución H3 y polígonos urbanos PostGIS.
 */
export interface ConfiguracionEspacialH3 {
  id: string;
  resolucionH3Default: number;
  resolucionMinima: number;
  resolucionMaxima: number;
  descripcion: string;
  fechaActualizacion: string;
  actualizadoPor: string;
}

export interface ActualizarResolucionH3Solicitud {
  resolucionH3Default: number;
  justificacionAuditoria: string;
}

export interface PoligonoUrbano {
  idZona: string;
  nombreZona: string;
  descripcion?: string;
  geometriaGeoJson: string;
  latitudCentroide: number;
  longitudCentroide: number;
  resolucionH3: number;
  idCeldaH3Centroide: string;
  totalCeldasH3Cubiertas: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  actualizadoPor?: string;
}

export interface CrearPoligonoUrbanoSolicitud {
  idZona: string;
  nombreZona: string;
  descripcion?: string;
  geometriaGeoJson: string;
  resolucionH3?: number;
  justificacionAuditoria: string;
}

export interface ModificarPoligonoUrbanoSolicitud {
  nombreZona: string;
  descripcion?: string;
  geometriaGeoJson: string;
  resolucionH3?: number;
  activo?: boolean;
  justificacionAuditoria: string;
}

/**
 * Tipos para la gestión de usuarios institucionales.
 */
export type EstadoCuentaInstitucional = 'PENDIENTE_APROBACION' | 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA';

export interface InstitucionAdminResumen {
  idInstitucion: string;
  razonSocial: string;
  identificacionFiscalNit: string;
  correo: string;
  nombreContacto: string;
  telefonoContacto?: string;
  sectorActividad?: string;
  estadoCuenta: EstadoCuentaInstitucional;
  correoVerificado: boolean;
  activo: boolean;
  fechaRegistro: string;
  idPlan?: string;
  codigoPlan?: string;
  nombrePlan?: string;
  estadoSuscripcion?: string;
  fechaExpiracionSuscripcion?: string;
}

export interface PlanAdminResumen {
  idProducto: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  tipoPlan: string;
  duracionDias: number;
  esGratuito: boolean;
  activo: boolean;
}

export interface AprobarInstitucionSolicitud {
  idPlan?: string;
  codigoPlan?: string;
  motivo?: string;
}

export interface SuspenderInstitucionSolicitud {
  motivo: string;
}

export interface DarDeBajaInstitucionSolicitud {
  motivo: string;
}

export interface ReactivarInstitucionSolicitud {
  motivo?: string;
}

export interface RevocarSesionesSolicitud {
  motivo?: string;
}
