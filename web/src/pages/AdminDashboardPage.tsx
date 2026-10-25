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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Barra superior de navegación administrativa */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Almara Admin</span>
              <span className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                {sesion?.rol || 'ROLE_ADMIN'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">{sesion?.nombreCompleto || 'Administrador'}</span>
              <span className="text-[11px] text-slate-500">{sesion?.correo}</span>
            </div>

            <button
              onClick={manejarCerrarSesion}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs text-slate-700 transition-all font-medium cursor-pointer"
              title="Cerrar sesión de administrador"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Sesión Administrativa Autenticada</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido, {sesion?.nombreCompleto}
            </h1>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Tiene acceso global para parametrizar el catálogo emocional, calibrar umbrales de privacidad,
              ajustar resoluciones espaciales y gobernar las cuentas institucionales de Popayán.
            </p>
          </div>
        </div>

        {/* Módulos de Administración */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Módulos de Gestión del Sistema</h2>
          <p className="text-xs text-slate-500">
            Herramientas operativas de configuración, privacidad territorial y administración institucional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tarjeta Catálogo de Emociones */}
          <div
            onClick={() => navigate('/admin/emociones')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/emociones'); }}
            className="bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md rounded-2xl p-6 transition-all group flex flex-col justify-between cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Catálogo</span>
              <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-amber-700 transition-colors">Catálogo de Emociones</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Agregar, modificar y desactivar emociones y sus atributos visuales (colores e íconos).
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Auditoría integrada</span>
              <span className="text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">Gestionar →</span>
            </div>
          </div>

          {/* Tarjeta Umbrales del Mapa */}
          <div
            onClick={() => navigate('/admin/umbrales')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/umbrales'); }}
            className="bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md rounded-2xl p-6 transition-all group flex flex-col justify-between cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">Privacidad</span>
              <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-sky-700 transition-colors">Umbrales del Mapa</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Ajustar parámetro k-anonimato para visualizar emociones agregadas y proteger la privacidad.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>k ≥ 5 en caliente</span>
              <span className="text-sky-600 font-semibold group-hover:translate-x-1 transition-transform">Configurar →</span>
            </div>
          </div>

          {/* Tarjeta Zonas Geográficas H3 */}
          <div
            onClick={() => navigate('/admin/zonas-h3')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/zonas-h3'); }}
            className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-2xl p-6 transition-all group flex flex-col justify-between cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Territorio</span>
              <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">Zonas Geográficas H3</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Ajustar resolución espacial de celdas H3 e indexar polígonos urbanos en PostGIS.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>PostGIS Spatial DB</span>
              <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">Delimitar →</span>
            </div>
          </div>

          {/* Tarjeta Usuarios Institucionales */}
          <div
            onClick={() => navigate('/admin/instituciones')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/instituciones'); }}
            className="bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl p-6 transition-all group flex flex-col justify-between cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">Instituciones</span>
              <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-700 transition-colors">Usuarios Institucionales</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Aprobar cuentas, suspender o dar de baja, revocar sesiones y notificar vía SMTP/Email.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Notificaciones SMTP</span>
              <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">Administrar →</span>
            </div>
          </div>
        </div>

        {/* Panel inferior informativo */}
        <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Su sesión expira en 8 horas.</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Trazabilidad activa para log de auditoría</span>
          </div>
        </div>
      </main>
    </div>
  );
};
