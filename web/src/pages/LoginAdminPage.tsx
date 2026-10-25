import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../services/apiAdmin';
import { useAuthAdmin } from '../context/AuthAdminContext';
import { ErrorApiAdmin } from '../types/admin';

export const LoginAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { guardarSesion } = useAuthAdmin();

  const [usuarioAdmin, setUsuarioAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estaBloqueado, setEstaBloqueado] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioAdmin.trim() || !passwordAdmin.trim()) {
      setError('Por favor ingrese el usuario/correo y la contraseña.');
      return;
    }

    setCargando(true);
    setError(null);
    setEstaBloqueado(false);

    try {
      const respuesta = await loginAdmin({
        usuarioAdmin: usuarioAdmin.trim(),
        passwordAdmin: passwordAdmin.trim(),
      });

      guardarSesion(respuesta);
      navigate('/admin/dashboard');
    } catch (err) {
      const errorApi = err as ErrorApiAdmin;
      if (errorApi.codigoEstado === 423 || errorApi.error === 'CUENTA_BLOQUEADA_TEMPORALMENTE') {
        setEstaBloqueado(true);
        setError(errorApi.mensaje || 'Cuenta administrativa temporalmente bloqueada por seguridad.');
      } else {
        setError(errorApi.mensaje || 'Credenciales administrativas incorrectas o cuenta no autorizada.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Resplandores decorativos de fondo en modo claro */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Cabecera / Marca Admin */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-md shadow-amber-500/20 mb-4 border border-amber-300">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistema Almara • Módulo Administrativo Global
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Iniciar Sesión de Administrador</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingrese con sus credenciales autorizadas.
            </p>
          </div>

          {error && (
            <div
              className={`mb-5 p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                estaBloqueado
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">
                  {estaBloqueado ? 'Acceso temporalmente suspendido' : 'Error de autenticación'}
                </p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div>
              <label
                htmlFor="usuarioAdmin"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Usuario o Correo Administrativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="usuarioAdmin"
                  type="text"
                  value={usuarioAdmin}
                  onChange={(e) => setUsuarioAdmin(e.target.value)}
                  placeholder="admin@almara.com"
                  disabled={cargando}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordAdmin"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordAdmin"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={passwordAdmin}
                  onChange={(e) => setPasswordAdmin(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={cargando}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
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
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Información de entorno de desarrollo */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Credencial preconfigurada: <code className="bg-slate-100 text-amber-800 font-mono px-1.5 py-0.5 rounded border border-slate-200">admin@almara.com</code> / <code className="bg-slate-100 text-amber-800 font-mono px-1.5 py-0.5 rounded border border-slate-200">Admin1234*</code>
            </p>
          </div>
        </div>

        {/* Enlace al mapa ciudadano o login institucional */}
        <div className="mt-6 text-center text-xs text-slate-500 space-x-4">
          <a href="/" className="hover:text-amber-600 transition-colors">
            ← Volver al Mapa Público
          </a>
          <span>•</span>
          <a href="/institutional/login" className="hover:text-amber-600 transition-colors">
            Acceso Institucional
          </a>
        </div>
      </div>
    </div>
  );
};
