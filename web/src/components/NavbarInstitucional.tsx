import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';

export const NavbarInstitucional: React.FC = () => {
  const { sesion, cerrarSesion } = useAuthInstitutional();
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);

  const handleLogout = async () => {
    setCerrando(true);
    try {
      await cerrarSesion();
    } finally {
      setCerrando(false);
      navigate('/institutional/login', { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Nav Links */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/institutional/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-sky-500/20">
              A
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide text-slate-900">
                ALMARA SAAS
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                Inteligencia Emocional Urbana
              </div>
            </div>
          </div>

          {sesion && (
            <nav className="hidden md:flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => navigate('/institutional/dashboard')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Panel
              </button>
              <button
                onClick={() => navigate('/institutional/mi-suscripcion')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Mi Suscripción
              </button>
              <button
                onClick={() => navigate('/institutional/planes')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Planes SaaS
              </button>
            </nav>
          )}
        </div>

        {/* User Info & Actions */}
        {sesion && (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800 truncate max-w-[220px]">
                {sesion.razonSocial}
              </span>
              <span className="text-xs text-slate-500">
                {sesion.correoInstitucional}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                {sesion.nombrePlan || sesion.codigoPlan}
              </span>

              {sesion.requiereRenovacion && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 border border-amber-300 text-amber-800 animate-pulse">
                  Renovación Requerida
                </span>
              )}
            </div>

            <button
              id="btn-logout-institucional"
              onClick={handleLogout}
              disabled={cerrando}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 cursor-pointer"
              title="Cerrar sesión segura y revocar token"
            >
              {cerrando ? (
                <>
                  <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Cerrando...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
