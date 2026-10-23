import React, { useState } from 'react';
import {
  registrarInstitucion,
  verificarCorreoInstitucion,
} from '../services/apiInstitutional';
import {
  RegistroInstitucionalSolicitud,
  RegistroInstitucionalRespuesta,
  ErrorApi,
} from '../types/institutional';

const DOMINIOS_PROHIBIDOS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'live.com',
  'icloud.com',
];

export const RegistroInstitucionalPage: React.FC = () => {
  const [formulario, setFormulario] = useState<RegistroInstitucionalSolicitud>({
    razonSocial: '',
    identificacionFiscalNit: '',
    nombreContacto: '',
    correoCorporativo: '',
    password: '',
    telefonoContacto: '',
    sectorActividad: 'GOBIERNO',
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState<RegistroInstitucionalRespuesta | null>(null);

  // Estado para el modal/campo de verificación rápida demo
  const [tokenVerificacion, setTokenVerificacion] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [cuentaActivada, setCuentaActivada] = useState(false);

  // Validación de robustez de contraseña en tiempo real
  const tieneMinimo8 = formulario.password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(formulario.password);
  const tieneMinuscula = /[a-z]/.test(formulario.password);
  const tieneNumero = /\d/.test(formulario.password);
  const tieneSimbolo = /[@#$%^&+=!*()_\-[\]{}|;:,.<>?/~`]/.test(formulario.password);
  const passwordValido = tieneMinimo8 && tieneMayuscula && tieneMinuscula && tieneNumero && tieneSimbolo;

  // Validación de dominio corporativo en tiempo real
  const dominio = formulario.correoCorporativo.includes('@')
    ? formulario.correoCorporativo.split('@').pop()?.toLowerCase() || ''
    : '';
  const esDominioProhibido = DOMINIOS_PROHIBIDOS.includes(dominio);

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esDominioProhibido) {
      setError(`No se permiten correos de dominios públicos gratuitos (${dominio}). Utilice el dominio corporativo o gubernamental de su entidad.`);
      return;
    }
    if (!passwordValido) {
      setError('La contraseña no cumple con todos los requisitos de seguridad requeridos.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await registrarInstitucion(formulario);
      setRegistroExitoso(respuesta);
      if (respuesta.tokenVerificacionSimulado) {
        setTokenVerificacion(respuesta.tokenVerificacionSimulado);
      }
    } catch (err) {
      const errorApi = err as ErrorApi;
      setError(errorApi.mensaje || 'Ocurrió un error al procesar el registro institucional.');
    } finally {
      setCargando(false);
    }
  };

  const manejarVerificacion = async () => {
    if (!tokenVerificacion.trim()) {
      setError('Por favor ingrese el token de verificación recibido.');
      return;
    }
    setVerificando(true);
    setError(null);
    try {
      await verificarCorreoInstitucion({ tokenVerificacion: tokenVerificacion.trim() });
      setCuentaActivada(true);
    } catch (err) {
      const errorApi = err as ErrorApi;
      setError(errorApi.mensaje || 'El token de verificación es inválido o ha expirado.');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <div style={estilos.encabezado}>
          <h1 style={estilos.titulo}>Almara Institucional</h1>
          <p style={estilos.subtitulo}>
            Registro de Entidades Públicas, Universidades y Empresas
          </p>
        </div>

        {error && <div style={estilos.alertaError}>{error}</div>}

        {!registroExitoso ? (
          <form onSubmit={manejarEnvio} style={estilos.formulario}>
            <div style={estilos.grupo}>
              <label style={estilos.etiqueta}>Razón Social / Nombre de la Entidad *</label>
              <input
                type="text"
                name="razonSocial"
                value={formulario.razonSocial}
                onChange={manejarCambio}
                placeholder="Ej. Alcaldía Municipal de Popayán"
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.fila}>
              <div style={estilos.grupoFila}>
                <label style={estilos.etiqueta}>NIT o Identificación Fiscal *</label>
                <input
                  type="text"
                  name="identificacionFiscalNit"
                  value={formulario.identificacionFiscalNit}
                  onChange={manejarCambio}
                  placeholder="Ej. 891500761-4"
                  required
                  style={estilos.input}
                />
              </div>

              <div style={estilos.grupoFila}>
                <label style={estilos.etiqueta}>Sector de Actividad</label>
                <select
                  name="sectorActividad"
                  value={formulario.sectorActividad}
                  onChange={manejarCambio}
                  style={estilos.select}
                >
                  <option value="GOBIERNO">Gobierno / Alcaldía</option>
                  <option value="EDUCACION">Educación / Universidad</option>
                  <option value="EVENTOS">Eventos / Cultura</option>
                  <option value="PRIVADO">Sector Privado / Empresa</option>
                </select>
              </div>
            </div>

            <div style={estilos.fila}>
              <div style={estilos.grupoFila}>
                <label style={estilos.etiqueta}>Nombre del Contacto Directo *</label>
                <input
                  type="text"
                  name="nombreContacto"
                  value={formulario.nombreContacto}
                  onChange={manejarCambio}
                  placeholder="Ej. Dra. María Pérez"
                  required
                  style={estilos.input}
                />
              </div>

              <div style={estilos.grupoFila}>
                <label style={estilos.etiqueta}>Teléfono de Contacto</label>
                <input
                  type="tel"
                  name="telefonoContacto"
                  value={formulario.telefonoContacto}
                  onChange={manejarCambio}
                  placeholder="Ej. 3101234567"
                  style={estilos.input}
                />
              </div>
            </div>

            <div style={estilos.grupo}>
              <label style={estilos.etiqueta}>Correo Corporativo / Institucional *</label>
              <input
                type="email"
                name="correoCorporativo"
                value={formulario.correoCorporativo}
                onChange={manejarCambio}
                placeholder="Ej. contacto@popayan.gov.co"
                required
                style={estilos.input}
              />
              {esDominioProhibido && (
                <span style={estilos.textoAdvertencia}>
                  ⚠️ Ingrese un correo con dominio corporativo de su institución (no @{dominio}).
                </span>
              )}
            </div>

            <div style={estilos.grupo}>
              <label style={estilos.etiqueta}>Contraseña Segura *</label>
              <input
                type="password"
                name="password"
                value={formulario.password}
                onChange={manejarCambio}
                placeholder="Mínimo 8 caracteres con mayúscula, número y símbolo"
                required
                style={estilos.input}
              />
              <div style={estilos.reglasPassword}>
                <span style={tieneMinimo8 ? estilos.reglaOk : estilos.reglaPendiente}>
                  {tieneMinimo8 ? '✓' : '○'} Mínimo 8 caracteres
                </span>
                <span style={tieneMayuscula ? estilos.reglaOk : estilos.reglaPendiente}>
                  {tieneMayuscula ? '✓' : '○'} Una mayúscula
                </span>
                <span style={tieneNumero ? estilos.reglaOk : estilos.reglaPendiente}>
                  {tieneNumero ? '✓' : '○'} Un número
                </span>
                <span style={tieneSimbolo ? estilos.reglaOk : estilos.reglaPendiente}>
                  {tieneSimbolo ? '✓' : '○'} Un carácter especial
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || esDominioProhibido || !passwordValido}
              style={{
                ...estilos.botonPrimario,
                opacity: cargando || esDominioProhibido || !passwordValido ? 0.6 : 1,
              }}
            >
              {cargando ? 'Registrando entidad...' : 'Registrar Cuenta Institucional'}
            </button>
          </form>
        ) : (
          <div style={estilos.cajaExito}>
            <h2 style={estilos.tituloExito}>¡Solicitud de Registro Enviada!</h2>
            <p style={estilos.textoExito}>{registroExitoso.mensaje}</p>

            <div style={estilos.tarjetaVerificacion}>
              <h3 style={estilos.subtituloVerificacion}>Verificación Inmediata de Correo (Modo Demo)</h3>
              <p style={estilos.instruccionVerificacion}>
                Hemos despachado un token a <strong>{registroExitoso.correoCorporativo}</strong>. En este entorno de desarrollo, el token simulado ya se encuentra prellenado:
              </p>
              <input
                type="text"
                value={tokenVerificacion}
                onChange={(e) => setTokenVerificacion(e.target.value)}
                placeholder="Token de verificación UUID"
                style={estilos.inputToken}
              />
              <button
                type="button"
                onClick={manejarVerificacion}
                disabled={verificando || cuentaActivada}
                style={estilos.botonVerificar}
              >
                {verificando ? 'Verificando...' : cuentaActivada ? '✓ Cuenta Activada con Plan Free' : 'Verificar y Activar Cuenta Ahora'}
              </button>

              {cuentaActivada && (
                <div style={estilos.alertaActivada}>
                  🎉 ¡Cuenta activada con éxito con <strong>Plan Institucional Básico (Freemium)</strong>! Ahora puede iniciar sesión con sus credenciales.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const estilos: Record<string, React.CSSProperties> = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: '24px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  tarjeta: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '640px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#F8FAFC',
  },
  encabezado: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#38BDF8',
    margin: '0 0 8px 0',
  },
  subtitulo: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fila: {
    display: 'flex',
    gap: '16px',
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  grupoFila: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  etiqueta: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#CBD5E1',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
  },
  textoAdvertencia: {
    color: '#F59E0B',
    fontSize: '12px',
    marginTop: '4px',
  },
  reglasPassword: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '6px',
  },
  reglaOk: {
    fontSize: '11px',
    color: '#10B981',
  },
  reglaPendiente: {
    fontSize: '11px',
    color: '#64748B',
  },
  botonPrimario: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  alertaError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #EF4444',
    color: '#FCA5A5',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  cajaExito: {
    textAlign: 'center',
  },
  tituloExito: {
    color: '#10B981',
    fontSize: '20px',
    margin: '0 0 8px 0',
  },
  textoExito: {
    color: '#CBD5E1',
    fontSize: '14px',
    marginBottom: '20px',
  },
  tarjetaVerificacion: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
  },
  subtituloVerificacion: {
    fontSize: '15px',
    color: '#38BDF8',
    margin: '0 0 8px 0',
  },
  instruccionVerificacion: {
    fontSize: '13px',
    color: '#94A3B8',
    marginBottom: '12px',
  },
  inputToken: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#1E293B',
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '12px',
  },
  botonVerificar: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  alertaActivada: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid #10B981',
    borderRadius: '6px',
    color: '#6EE7B7',
    fontSize: '13px',
  },
};
