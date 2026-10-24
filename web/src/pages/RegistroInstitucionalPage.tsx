import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      setError(`No se permiten correos de dominios públicos (${dominio}). Utilice el dominio corporativo o institucional oficial.`);
      return;
    }
    if (!passwordValido) {
      setError('La contraseña no cumple con todos los requisitos de seguridad obligatorios.');
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
      setError('Por favor ingrese el token de verificación.');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Luces de fondo */}
      <div className="absolute top-10 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 my-8">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/25 mb-4">
            <span className="text-white font-extrabold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Almara Institucional
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro Oficial de Entidades Gubernamentales, Educativas y Corporativas
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-10 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5">
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          {!registroExitoso ? (
            <form onSubmit={manejarEnvio} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Razón Social / Nombre Oficial de la Entidad *
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formulario.razonSocial}
                  onChange={manejarCambio}
                  placeholder="Ej. Alcaldía Municipal de Popayán"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    NIT o Identificación Fiscal *
                  </label>
                  <input
                    type="text"
                    name="identificacionFiscalNit"
                    value={formulario.identificacionFiscalNit}
                    onChange={manejarCambio}
                    placeholder="Ej. 891500761-4"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Sector de Actividad *
                  </label>
                  <select
                    name="sectorActividad"
                    value={formulario.sectorActividad}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition cursor-pointer"
                  >
                    <option value="GOBIERNO">Gobierno y Entidades Públicas</option>
                    <option value="EDUCACION">Educación e Investigación</option>
                    <option value="EVENTOS">Gestión de Eventos y Cultura</option>
                    <option value="PRIVADO">Sector Privado y Servicios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Nombre del Representante o Contacto *
                  </label>
                  <input
                    type="text"
                    name="nombreContacto"
                    value={formulario.nombreContacto}
                    onChange={manejarCambio}
                    placeholder="Ej. Dra. Martha Lucía Gómez"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Teléfono Corporativo (Opcional)
                  </label>
                  <input
                    type="tel"
                    name="telefonoContacto"
                    value={formulario.telefonoContacto}
                    onChange={manejarCambio}
                    placeholder="Ej. +57 (602) 820 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Correo Corporativo / Institucional *
                </label>
                <input
                  type="email"
                  name="correoCorporativo"
                  value={formulario.correoCorporativo}
                  onChange={manejarCambio}
                  placeholder="Ej. contacto@popayan.gov.co"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />
                {esDominioProhibido && (
                  <p className="text-xs text-amber-400 mt-1.5 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>No se admiten dominios personales ({dominio}). Utilice el dominio oficial de su institución.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Contraseña de Acceso *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formulario.password}
                  onChange={manejarCambio}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />

                {/* Checklist de Requisitos de Contraseña */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <span className={tieneMinimo8 ? 'text-emerald-400' : 'text-slate-500'}>
                    {tieneMinimo8 ? '✓' : '○'} Mínimo 8 caracteres
                  </span>
                  <span className={tieneMayuscula ? 'text-emerald-400' : 'text-slate-500'}>
                    {tieneMayuscula ? '✓' : '○'} Una mayúscula
                  </span>
                  <span className={tieneMinuscula ? 'text-emerald-400' : 'text-slate-500'}>
                    {tieneMinuscula ? '✓' : '○'} Una minúscula
                  </span>
                  <span className={tieneNumero ? 'text-emerald-400' : 'text-slate-500'}>
                    {tieneNumero ? '✓' : '○'} Un número
                  </span>
                  <span className={tieneSimbolo ? 'text-emerald-400' : 'text-slate-500'}>
                    {tieneSimbolo ? '✓' : '○'} Carácter especial (@$!%*?)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando || esDominioProhibido || !passwordValido}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 cursor-pointer"
              >
                {cargando ? 'Procesando registro...' : 'Registrar Entidad Institucional'}
              </button>
            </form>
          ) : (
            /* Pantalla de Confirmación y Verificación de Correo */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">¡Registro Exitoso!</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  Se ha enviado un enlace de confirmación al correo institucional registrado (
                  <span className="font-semibold text-sky-400">{formulario.correoCorporativo}</span>).
                </p>
              </div>

              {/* Caja de Verificación Demo */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400">
                    Activación Inmediata de Cuenta
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingrese el token de verificación simulado emitido por el sistema para activar su cuenta y asignar automáticamente el Plan Básico Gratuito:
                  </p>
                </div>

                <input
                  type="text"
                  value={tokenVerificacion}
                  onChange={(e) => setTokenVerificacion(e.target.value)}
                  placeholder="Token de verificación"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 font-mono text-xs focus:outline-none focus:border-sky-500"
                />

                <button
                  onClick={manejarVerificacion}
                  disabled={verificando || cuentaActivada}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {verificando ? 'Verificando...' : cuentaActivada ? '✓ Cuenta Activada' : 'Verificar y Activar Cuenta'}
                </button>

                {cuentaActivada && (
                  <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs text-center space-y-3">
                    <p>🎉 Su cuenta ha sido activada con éxito. Ya puede iniciar sesión con sus credenciales.</p>
                    <Link
                      to="/institutional/login"
                      className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      Ir al Inicio de Sesión →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enlaces de pie */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              ¿Ya tiene una cuenta institucional registrada?{' '}
              <Link to="/institutional/login" className="font-semibold text-sky-400 hover:text-sky-300">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
