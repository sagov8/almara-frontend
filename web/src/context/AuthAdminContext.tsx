import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginAdminRespuesta } from '../types/admin';
import { logoutAdmin } from '../services/apiAdmin';

interface ContextoAutenticacionAdmin {
  sesion: LoginAdminRespuesta | null;
  autenticado: boolean;
  guardarSesion: (datos: LoginAdminRespuesta) => void;
  cerrarSesion: () => Promise<void>;
}

const AuthAdminContext = createContext<ContextoAutenticacionAdmin | undefined>(undefined);

const CLAVE_STORAGE_ADMIN = 'almara_admin_session';

export const AuthAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sesion, setSesion] = useState<LoginAdminRespuesta | null>(() => {
    try {
      const guardada = sessionStorage.getItem(CLAVE_STORAGE_ADMIN);
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (sesion) {
      sessionStorage.setItem(CLAVE_STORAGE_ADMIN, JSON.stringify(sesion));
    } else {
      sessionStorage.removeItem(CLAVE_STORAGE_ADMIN);
    }
  }, [sesion]);

  const guardarSesion = useCallback((datos: LoginAdminRespuesta) => {
    setSesion(datos);
  }, []);

  const cerrarSesion = useCallback(async () => {
    const tokenActual = sesion?.token;
    try {
      if (tokenActual) {
        await logoutAdmin(tokenActual);
      }
    } catch {
      // Ignorar errores de red si ya expiró o hubo corte de red
    } finally {
      setSesion(null);
      sessionStorage.removeItem(CLAVE_STORAGE_ADMIN);
      localStorage.removeItem(CLAVE_STORAGE_ADMIN);
    }
  }, [sesion]);

  return (
    <AuthAdminContext.Provider
      value={{
        sesion,
        autenticado: !!sesion?.token,
        guardarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthAdminContext.Provider>
  );
};

export const useAuthAdmin = (): ContextoAutenticacionAdmin => {
  const contexto = useContext(AuthAdminContext);
  if (!contexto) {
    throw new Error('useAuthAdmin debe ser utilizado dentro de un AuthAdminProvider');
  }
  return contexto;
};
