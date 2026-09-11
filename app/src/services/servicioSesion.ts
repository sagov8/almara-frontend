/**
 * Servicio de gestión de sesión anónima (HU-01 / RNF Seguridad).
 * Genera y almacena en memoria un identificador aleatorio efímero (tokenSesionTemporal).
 * No recopila ni guarda ninguna información personal identificable (PII).
 */

let tokenMemoria: string | null = null;

/**
 * Genera un UUID v4 criptográficamente aleatorio sin dependencias pesadas.
 */
function generarUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtiene el token de sesión anónimo actual o genera uno nuevo si no existe.
 */
export function obtenerTokenSesionTemporal(): string {
  if (!tokenMemoria) {
    tokenMemoria = 'almara_anon_' + generarUuidV4();
  }
  return tokenMemoria;
}

/**
 * Permite rotar o reiniciar el token anónimo si es necesario.
 */
export function reiniciarTokenSesion(): string {
  tokenMemoria = 'almara_anon_' + generarUuidV4();
  return tokenMemoria;
}
