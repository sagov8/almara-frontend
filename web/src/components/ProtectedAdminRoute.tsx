import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthAdmin } from '../context/AuthAdminContext';

/**
 * Componente guardián para proteger las vistas del Módulo de Administración.
 * Redirige a /admin/login si el usuario no tiene una sesión administrativa activa (HU-11).
 */
export const ProtectedAdminRoute: React.FC = () => {
  const { autenticado, sesion } = useAuthAdmin();

  if (!autenticado || sesion?.rol !== 'ROLE_ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
