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

export interface ModuloCatalogoDto {
  idModulo: string;
  codigoModulo: string;
  nombreModulo: string;
  descripcion: string;
  esPremium: boolean;
  habilitadoEnPlan: boolean;
  endpointRestringido: string;
}

export interface PlanSuscripcionCatalogoDto {
  idProducto: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  precioFinal: number;
  tipoPlan: string;
  duracionDias: number;
  esGratuito: boolean;
  esPlanActual: boolean;
  modulos: ModuloCatalogoDto[];
}

export interface CatalogoPlanesRespuesta {
  planes: PlanSuscripcionCatalogoDto[];
  totalPlanesActivos: number;
  codigoPlanActualCliente?: string;
  tiempoConsultaMs: number;
}

export interface ResumenOrdenSuscripcionDto {
  idOrden: string;
  numeroOrden: string;
  nombrePlan: string;
  montoTotal: number;
  estadoOrden: string;
  fechaEmision: string;
}

export interface EstadoSuscripcionRespuesta {
  idSuscripcion?: string;
  idInstitucion: string;
  razonSocial: string;
  codigoPlan: string;
  nombrePlan: string;
  precioPlan: number;
  esGratuito: boolean;
  estadoSuscripcion: string;
  vigente: boolean;
  fechaInicio?: string;
  fechaExpiracion?: string;
  diasRestantes: number;
  alertaVencimiento: boolean;
  mensajeEstado: string;
  modulosHabilitados: string[];
  modulosRestringidos: string[];
  historialOrdenes: ResumenOrdenSuscripcionDto[];
}

export interface AdquirirPlanSolicitud {
  codigoPlan: string;
  metodoPagoPreferido?: string;
}

export interface LineaDetalleDto {
  idLinea: string;
  concepto: string;
  cantidad: number;
  precioAplicado: number;
  subtotal: number;
}

export interface OrdenSuscripcionRespuesta {
  idOrden: string;
  numeroOrden: string;
  idInstitucion: string;
  idPlanSeleccionado: string;
  codigoPlan: string;
  nombrePlan: string;
  duracionDias: number;
  fechaEmision: string;
  estadoOrden: 'PENDIENTE_PAGO' | 'PAGADA' | 'FALLIDA' | 'CANCELADA';
  montoTotal: number;
  lineasDetalle: LineaDetalleDto[];
  siguientePaso: string;
}

export interface ProcesarPagoSolicitud {
  idOrden: string;
  metodoPago: string;
  tokenMedioPago: string;
}

export interface PagoSuscripcionRespuesta {
  idPago: string;
  idOrden: string;
  numeroOrden: string;
  referenciaExterna: string;
  montoPagado: number;
  metodoPago: string;
  estadoPago: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';
  motivoRechazo?: string;
  pagoAprobado: boolean;
  permiteReintento: boolean;
  estadoOrden: 'PENDIENTE_PAGO' | 'PAGADA' | 'FALLIDA' | 'CANCELADA';
  codigoPlanActivado?: string;
  estadoSuscripcion?: string;
  nuevaFechaExpiracion?: string;
  notificacionEnviada: boolean;
  tokenAccesoActualizado?: string;
  mensaje: string;
}

export interface VerificarModuloRespuesta {
  accesoPermitido: boolean;
  codigoModulo: string;
  codigoPlan: string;
  estadoSuscripcion: string;
  mensaje: string;
}

export interface MatrizPermisosRespuesta {
  idInstitucion: string;
  idSuscripcion: string;
  codigoPlan: string;
  nombrePlan: string;
  estadoSuscripcion: string;
  fechaExpiracion: string;
  suscripcionVigente: boolean;
  modulos: ModuloCatalogoDto[];
}

export interface IndicadorEmocionCiudadDto {
  idEmocion: string;
  nombreEmocion: string;
  codigoHexColor: string;
  icono: string;
  porcentajeGlobal: number;
}

export interface ZonaTerritorialAnaliticaDto {
  idCeldaH3: string;
  zonaManualId?: string;
  nombreZona: string;
  descripcionZona?: string;
  latitudCentroide: number;
  longitudCentroide: number;
  cumpleUmbral: boolean;
  emocionPredominante?: string;
  nombreEmocionPredominante?: string;
  codigoHexColor?: string;
  icono?: string;
  intensidadPromedio: number;
  participantesAproximados: string;
  distribucionPorcentual?: Record<string, number>;
  tendencia?: string;
}

export interface DashboardInstitucionalResumenRespuesta {
  idInstitucion: string;
  razonSocial: string;
  codigoPlanActivo: string;
  periodoConsultado: string;
  totalZonasMonitoreadas: number;
  zonasConDatosSuficientes: number;
  zonasEnReservaPrivacidad: number;
  emocionPredominanteCiudad: string;
  intensidadPromedioCiudad: number;
  distribucionGlobalCiudad: IndicadorEmocionCiudadDto[];
  resumenZonas: ZonaTerritorialAnaliticaDto[];
  filtroTerritorialHabilitado: boolean;
  exportacionHabilitada: boolean;
  tiempoCalculoMs: number;
}

export interface FiltroTerritorialDashboardRespuesta {
  zonaFiltrada: string;
  emocionFiltrada: string;
  periodoConsultado: string;
  totalZonasCoincidentes: number;
  zonasFiltradas: ZonaTerritorialAnaliticaDto[];
  tiempoCalculoMs: number;
}

export interface ReporteAnaliticoExportacionRespuesta {
  idInstitucion: string;
  razonSocial: string;
  identificacionFiscalNit: string;
  planSuscripcion: string;
  formato: string;
  fechaGeneracion: string;
  totalZonasExportadas: number;
  declaracionPrivacidad: string;
  datosZonas: ZonaTerritorialAnaliticaDto[];
}
