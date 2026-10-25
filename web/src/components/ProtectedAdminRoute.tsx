import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthAdmin } from '../context/AuthAdminContext';

/**
 * Componente guardián para proteger las vistas del Módulo de Administración.
 * Redirige a /admin/login si el usuario no tiene una sesión administrativa activa
 * e impide el reingreso retrospectivo mediante el botón "Atrás" del navegador tras cerrar sesión.
 */
export const ProtectedAdminRoute: React.FC = () => {
  const { autenticado, sesion } = useAuthAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Control de cache de navegación e historial (seguridad contra botón Atrás tras logout)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !sessionStorage.getItem('almara_admin_session')) {
        navigate('/admin/login', { replace: true });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [navigate]);

  if (!autenticado || sesion?.rol !== 'ROLE_ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
