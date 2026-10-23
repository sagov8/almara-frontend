import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

      // Redirección inteligente según el criterio 4 de HU-17
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
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        <div style={estilos.encabezado}>
          <h1 style={estilos.titulo}>Iniciar Sesión</h1>
          <p style={estilos.subtitulo}>Portal Corporativo e Institucional — Almara</p>
        </div>

        {error && <div style={estilos.alertaError}>{error}</div>}

        <form onSubmit={manejarEnvio} style={estilos.formulario}>
          <div style={estilos.grupo}>
            <label style={estilos.etiqueta}>Correo Corporativo / Institucional</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setError(null);
              }}
              placeholder="ej. contacto@popayan.gov.co"
              required
              style={estilos.input}
            />
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.etiqueta}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Ingrese su contraseña"
              required
              style={estilos.input}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...estilos.botonPrimario,
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? 'Verificando credenciales...' : 'Ingresar al Portal Institucional'}
          </button>
        </form>

        <div style={estilos.pie}>
          <span style={estilos.textoPie}>¿Aún no tiene cuenta corporativa?</span>
          <Link to="/institutional/registro" style={estilos.enlace}>
            Registrar nueva entidad
          </Link>
        </div>
      </div>
    </div>
  );
};

const estilos: Record<string, React.CSSProperties> = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: '24px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  tarjeta: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '36px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#F8FAFC',
  },
  encabezado: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#38BDF8',
    margin: '0 0 8px 0',
  },
  subtitulo: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  etiqueta: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#CBD5E1',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
  },
  botonPrimario: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  alertaError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #EF4444',
    color: '#FCA5A5',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  pie: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    borderTop: '1px solid #334155',
    paddingTop: '18px',
  },
  textoPie: {
    fontSize: '13px',
    color: '#94A3B8',
  },
  enlace: {
    color: '#38BDF8',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
  },
};
