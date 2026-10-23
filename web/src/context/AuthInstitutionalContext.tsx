import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginInstitucionalRespuesta } from '../types/institutional';
import { cerrarSesionInstitucion } from '../services/apiInstitutional';

interface ContextoAutenticacion {
  sesion: LoginInstitucionalRespuesta | null;
  autenticado: boolean;
  guardarSesion: (datos: LoginInstitucionalRespuesta) => void;
  cerrarSesion: () => Promise<void>;
}

const AuthInstitutionalContext = createContext<ContextoAutenticacion | undefined>(undefined);

const CLAVE_STORAGE = 'almara_inst_session';

export const AuthInstitutionalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sesion, setSesion] = useState<LoginInstitucionalRespuesta | null>(() => {
    try {
      const guardada = sessionStorage.getItem(CLAVE_STORAGE);
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (sesion) {
      sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion));
    } else {
      sessionStorage.removeItem(CLAVE_STORAGE);
    }
  }, [sesion]);

  const guardarSesion = useCallback((datos: LoginInstitucionalRespuesta) => {
    setSesion(datos);
  }, []);

  const cerrarSesion = useCallback(async () => {
    const tokenActual = sesion?.tokenAcceso;
    try {
      if (tokenActual) {
        await cerrarSesionInstitucion(tokenActual);
      }
    } catch {
      // Ignoramos error de red si el token ya expiró o el servidor no responde
    } finally {
      setSesion(null);
      sessionStorage.removeItem(CLAVE_STORAGE);
      localStorage.removeItem(CLAVE_STORAGE);
    }
  }, [sesion]);

  return (
    <AuthInstitutionalContext.Provider
      value={{
        sesion,
        autenticado: !!sesion?.tokenAcceso,
        guardarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthInstitutionalContext.Provider>
  );
};

export const useAuthInstitutional = (): ContextoAutenticacion => {
  const contexto = useContext(AuthInstitutionalContext);
  if (!contexto) {
    throw new Error('useAuthInstitutional debe ser utilizado dentro de AuthInstitutionalProvider');
  }
  return contexto;
};
