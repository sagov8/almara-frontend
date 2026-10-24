import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Smile,
  Sliders,
  MapPin,
  Building2,
  LogOut,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuthAdmin();

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra superior de navegación administrativa */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-400/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">Almara Admin</span>
              <span className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {sesion?.rol || 'ROLE_ADMIN'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{sesion?.nombreCompleto || 'Administrador'}</span>
              <span className="text-[11px] text-slate-400">{sesion?.correo}</span>
            </div>

            <button
              onClick={manejarCerrarSesion}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs text-slate-300 transition-all font-medium"
              title="Cerrar sesión de administrador (HU-18)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal del panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida y estado */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sesión Administrativa Autenticada (HU-11)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido, {sesion?.nombreCompleto}
            </h1>
            <p className="text-slate-300 text-sm mt-2">
              Tiene acceso global para parametrizar el catálogo emocional, calibrar umbrales de privacidad,
              ajustar resoluciones espaciales y gobernar las cuentas institucionales de Popayán.
            </p>
          </div>
        </div>

        {/* Módulos de Administración (Diagrama de Casos de Uso) */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Módulos de Gestión del Sistema</h2>
          <p className="text-xs text-slate-400">
            Casos de uso correspondientes al modelo de arquitectura del Módulo de Administración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tarjeta HU-12 */}
          <div
            onClick={() => navigate('/admin/emociones')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/emociones'); }}
            className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/70 hover:bg-slate-900 rounded-2xl p-6 transition-all group flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">HU-12</span>
              <h3 className="text-base font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">Catálogo de Emociones</h3>
              <p className="text-xs text-slate-400 mt-2">
                Agregar, modificar y desactivar emociones y sus atributos visuales (colores e íconos).
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Auditoría integrada</span>
              <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">Gestionar →</span>
            </div>
          </div>

          {/* Tarjeta HU-13 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">HU-13</span>
              <h3 className="text-base font-bold text-white mt-1">Umbrales del Mapa</h3>
              <p className="text-xs text-slate-400 mt-2">
                Ajustar parámetro $k$-anonimato para visualizar emociones agregadas y proteger la privacidad.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>k ≥ 5 en caliente</span>
              <span className="text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">Configurar →</span>
            </div>
          </div>

          {/* Tarjeta HU-14 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">HU-14</span>
              <h3 className="text-base font-bold text-white mt-1">Zonas Geográficas H3</h3>
              <p className="text-xs text-slate-400 mt-2">
                Ajustar resolución espacial de celdas H3 e indexar polígonos urbanos en PostGIS.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>PostGIS Spacial DB</span>
              <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">Delimitar →</span>
            </div>
          </div>

          {/* Tarjeta HU-15 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">HU-15</span>
              <h3 className="text-base font-bold text-white mt-1">Usuarios Institucionales</h3>
              <p className="text-xs text-slate-400 mt-2">
                Aprobar cuentas, suspender o dar de baja, revocar sesiones y notificar vía SMTP/Email.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Notificaciones SMTP</span>
              <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">Administrar →</span>
            </div>
          </div>
        </div>

        {/* Panel inferior informativo */}
        <div className="mt-10 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Sesión protegida por token JWT con firma HMAC-SHA256 (Expira en 8 horas).</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Trazabilidad activa en la tabla <code className="text-amber-300 font-mono">auditoria_admin</code>.</span>
          </div>
        </div>
      </main>
    </div>
  );
};
