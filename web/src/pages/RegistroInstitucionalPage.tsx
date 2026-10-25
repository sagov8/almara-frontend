import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, Eye, EyeOff, AlertTriangle, Mail, Sparkles, Check, X } from 'lucide-react';
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
  const [faseRegistro, setFaseRegistro] = useState('Registrando entidad institucional...');
  const [error, setError] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState<RegistroInstitucionalRespuesta | null>(null);

  const [tokenVerificacion, setTokenVerificacion] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [cuentaActivada, setCuentaActivada] = useState(false);

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  // Validación de robustez de contraseña en tiempo real
  const tieneMinimo8 = formulario.password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(formulario.password);
  const tieneMinuscula = /[a-z]/.test(formulario.password);
  const tieneNumero = /\d/.test(formulario.password);
  const tieneSimbolo = /[@#$%^&+=!*()_\-[\]{}|;:,.<>?/~`]/.test(formulario.password);
  const passwordValido = tieneMinimo8 && tieneMayuscula && tieneMinuscula && tieneNumero && tieneSimbolo;
  const passwordsCoinciden = formulario.password.length > 0 && formulario.password === confirmarPassword;

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
    if (!passwordsCoinciden) {
      setError('Las contraseñas no coinciden. Por favor confirme su contraseña.');
      return;
    }

    setCargando(true);
    setError(null);
    setFaseRegistro('Validando datos y enviando código de verificación por correo...');

    const timerFase = setTimeout(() => {
      setFaseRegistro('Despachando código OTP al correo corporativo vía SMTP...');
    }, 1200);

    try {
      const respuesta = await registrarInstitucion(formulario);
      setRegistroExitoso(respuesta);
      // El código de verificación ha sido despachado por correo electrónico.
      // Mantenemos el campo vacío para que el usuario ingrese el código recibido.
      setTokenVerificacion('');
    } catch (err) {
      const errorApi = err as ErrorApi;
      setError(errorApi.mensaje || 'Ocurrió un error al procesar el registro institucional.');
    } finally {
      clearTimeout(timerFase);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Luces de fondo decorativas sutiles */}
      <div className="absolute top-10 -left-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 my-8">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 mb-4">
            <span className="text-white font-extrabold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Almara Institucional
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro Oficial de Entidades Gubernamentales, Educativas y Corporativas
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-10 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          {!registroExitoso ? (
            <form onSubmit={manejarEnvio} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Razón Social / Nombre Oficial de la Entidad *
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formulario.razonSocial}
                  onChange={manejarCambio}
                  placeholder="Ej. Alcaldía Municipal de Popayán"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    NIT o Identificación Fiscal *
                  </label>
                  <input
                    type="text"
                    name="identificacionFiscalNit"
                    value={formulario.identificacionFiscalNit}
                    onChange={manejarCambio}
                    placeholder="Ej. 891500761-4"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Sector de Actividad *
                  </label>
                  <select
                    name="sectorActividad"
                    value={formulario.sectorActividad}
                    onChange={manejarCambio}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition cursor-pointer"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Nombre del Representante o Contacto *
                  </label>
                  <input
                    type="text"
                    name="nombreContacto"
                    value={formulario.nombreContacto}
                    onChange={manejarCambio}
                    placeholder="Ej. Dra. Martha Lucía Gómez"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Teléfono Corporativo (Opcional)
                  </label>
                  <input
                    type="tel"
                    name="telefonoContacto"
                    value={formulario.telefonoContacto}
                    onChange={manejarCambio}
                    placeholder="Ej. +57 (602) 820 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Correo Corporativo / Institucional *
                </label>
                <input
                  type="email"
                  name="correoCorporativo"
                  value={formulario.correoCorporativo}
                  onChange={manejarCambio}
                  placeholder="Ej. contacto@popayan.gov.co"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />
                {esDominioProhibido && (
                  <p className="text-xs text-amber-700 mt-1.5 flex items-center space-x-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                    <span>No se admiten dominios personales ({dominio}). Utilice el dominio oficial de su institución.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    name="password"
                    value={formulario.password}
                    onChange={manejarCambio}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Checklist de Requisitos de Contraseña */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <span className={`inline-flex items-center gap-1 ${tieneMinimo8 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {tieneMinimo8 ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block mr-0.5"></span>}
                    <span>Mínimo 8 caracteres</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 ${tieneMayuscula ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {tieneMayuscula ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block mr-0.5"></span>}
                    <span>Una mayúscula</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 ${tieneMinuscula ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {tieneMinuscula ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block mr-0.5"></span>}
                    <span>Una minúscula</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 ${tieneNumero ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {tieneNumero ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block mr-0.5"></span>}
                    <span>Un número</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 ${tieneSimbolo ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {tieneSimbolo ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block mr-0.5"></span>}
                    <span>Carácter especial (@$!%*?)</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={mostrarConfirmarPassword ? 'text' : 'password'}
                    name="confirmarPassword"
                    value={confirmarPassword}
                    onChange={(e) => {
                      setConfirmarPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={mostrarConfirmarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={mostrarConfirmarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarConfirmarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmarPassword.length > 0 && (
                  <p className={`text-xs mt-1.5 font-medium inline-flex items-center gap-1 ${passwordsCoinciden ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {passwordsCoinciden ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Las contraseñas no coinciden</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <button
                id="btn-registro-submit"
                type="submit"
                disabled={cargando || esDominioProhibido || !passwordValido || !passwordsCoinciden}
                aria-busy={cargando}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-600 via-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="truncate">{faseRegistro}</span>
                  </>
                ) : (
                  'Registrar Entidad Institucional'
                )}
              </button>
            </form>
          ) : (
            /* Pantalla de Confirmación y Verificación de Correo */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-sky-100 text-sky-800 text-[11px] font-semibold rounded-full mb-2">
                  Paso Final: Verificación Institucional
                </span>
                <h3 className="text-xl font-bold text-slate-900">Código de Verificación Enviado</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                  Hemos enviado un correo electrónico con su código de verificación a{' '}
                  <span className="font-semibold text-slate-900">{formulario.correoCorporativo}</span>.
                  Revise su bandeja de entrada (y la carpeta de spam o correo no deseado) e ingrese el código a continuación para validar y activar su cuenta.
                </p>
              </div>

              {/* Caja de Verificación */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                    Código de Validación (OTP) *
                  </label>
                  <input
                    type="text"
                    maxLength={36}
                    disabled={verificando || cuentaActivada}
                    value={tokenVerificacion}
                    onChange={(e) => setTokenVerificacion(e.target.value.trim())}
                    placeholder="Ej. 123456"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-center text-xl font-bold tracking-widest focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition placeholder-slate-300 disabled:opacity-60"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Ingrese el código numérico de 6 dígitos que recibió por correo.
                  </p>
                </div>

                <button
                  id="btn-verificar-codigo"
                  type="button"
                  onClick={manejarVerificacion}
                  disabled={verificando || cuentaActivada || !tokenVerificacion.trim()}
                  aria-busy={verificando}
                  className={`w-full py-3 px-4 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
                    verificando
                      ? 'bg-emerald-600 opacity-80 cursor-wait'
                      : cuentaActivada
                      ? 'bg-emerald-600 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer'
                  }`}
                >
                  {verificando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      <span>Validando código y activando cuenta...</span>
                    </>
                  ) : cuentaActivada ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Cuenta Activada</span>
                    </>
                  ) : (
                    <span>Validar Código y Activar Cuenta</span>
                  )}
                </button>

                {registroExitoso?.tokenVerificacionSimulado && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>¿Prueba en entorno local?</span>
                    <button
                      type="button"
                      onClick={() => setTokenVerificacion(registroExitoso.tokenVerificacionSimulado || '')}
                      className="text-sky-600 font-medium hover:underline hover:text-sky-700"
                    >
                      Autocompletar código de prueba
                    </button>
                  </div>
                )}

                {cuentaActivada && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-3">
                    <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>¡Cuenta institucional activada con éxito!</span>
                    </p>
                    <p className="text-emerald-700">
                      Su correo corporativo ha sido verificado satisfactoriamente y se ha asignado el Plan Institucional Base. Ya puede acceder con sus credenciales.
                    </p>
                    <Link
                      to="/institutional/login"
                      className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition"
                    >
                      Continuar al Inicio de Sesión →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enlaces de pie */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              ¿Ya tiene una cuenta institucional registrada?{' '}
              <Link to="/institutional/login" className="font-bold text-sky-600 hover:text-sky-700">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
