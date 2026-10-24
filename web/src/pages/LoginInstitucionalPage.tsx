import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { iniciarSesionInstitucion } from '../services/apiInstitutional';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { ErrorApi } from '../types/institutional';

export const LoginInstitucionalPage: React.FC = () => {
  const navigate = useNavigate();
  const { guardarSesion } = useAuthInstitutional();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !password.trim()) {
      setError('Por favor diligencie su correo corporativo y contraseña.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await iniciarSesionInstitucion({
        correoInstitucional: correo.trim(),
        password: password.trim(),
      });

      guardarSesion(respuesta);

      if (respuesta.requiereRenovacion) {
        navigate(respuesta.rutaRedireccion || '/institutional/planes/renovacion');
      } else {
        navigate(respuesta.rutaRedireccion || '/institutional/dashboard');
      }
    } catch (err) {
      const errorApi = err as ErrorApi;
      setError(errorApi.mensaje || 'Credenciales incorrectas o error en el inicio de sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Luces de fondo decorativas sutiles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Cabecera / Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 mb-4">
            <span className="text-white font-extrabold text-2xl">A</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Almara Institucional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plataforma de Inteligencia Emocional Urbana
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingrese con sus credenciales institucionales autorizadas
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Correo Corporativo
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError(null);
                }}
                placeholder="ej. contacto@popayan.gov.co"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Contraseña
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={cargando}
              aria-busy={cargando}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-600 via-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60 disabled:cursor-wait cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                'Ingresar al Portal Institucional'
              )}
            </button>
          </form>

          {/* Enlaces inferiores */}
          <div className="mt-7 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              ¿Su institución aún no tiene cuenta?{' '}
              <Link
                to="/institutional/registro"
                className="font-bold text-sky-600 hover:text-sky-700 transition"
              >
                Registrar Entidad
              </Link>
            </p>
            <div>
              <Link
                to="/institutional/planes"
                className="text-xs text-slate-500 hover:text-slate-700 font-medium transition"
              >
                Consultar Planes y Tarifas SaaS →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer pequeño */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Almara Ciudadanía e Inteligencia Emocional Colectiva &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
