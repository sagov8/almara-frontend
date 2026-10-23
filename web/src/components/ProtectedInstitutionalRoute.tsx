import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';

interface ProtectedInstitutionalRouteProps {
  children: React.ReactNode;
}

export const ProtectedInstitutionalRoute: React.FC<ProtectedInstitutionalRouteProps> = ({ children }) => {
  const { autenticado, sesion } = useAuthInstitutional();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Manejo de caché de navegación e historial ("Atrás" / "Adelante")
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !sessionStorage.getItem('almara_inst_session')) {
        navigate('/institutional/login', { replace: true });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [navigate]);

  if (!autenticado || !sesion) {
    return <Navigate to="/institutional/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
