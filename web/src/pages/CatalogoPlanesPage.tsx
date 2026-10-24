import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthInstitutional } from '../context/AuthInstitutionalContext';
import { consultarCatalogoPlanes } from '../services/apiInstitutional';
import { CatalogoPlanesRespuesta } from '../types/institutional';
import { NavbarInstitucional } from '../components/NavbarInstitucional';
import { TarjetaPlanSaaS } from '../components/TarjetaPlanSaaS';

export const CatalogoPlanesPage: React.FC = () => {
  const { sesion } = useAuthInstitutional();
  const navigate = useNavigate();

  const [catalogo, setCatalogo] = useState<CatalogoPlanesRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargarPlanes = async () => {
      setCargando(true);
      setErrorMensaje(null);
      try {
        const respuesta = await consultarCatalogoPlanes(sesion?.tokenAcceso);
        if (!cancelado) {
          setCatalogo(respuesta);
        }
      } catch (err: any) {
        if (!cancelado) {
          setErrorMensaje(err?.mensaje || 'No fue posible cargar el catálogo de planes SaaS.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarPlanes();

    return () => {
      cancelado = true;
    };
  }, [sesion]);

  const handleSeleccionarPlan = (codigoPlan: string) => {
    navigate(`/institutional/checkout?plan=${codigoPlan}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Cabecera Principal */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 uppercase tracking-widest">
            Catálogo Comercial Almara SaaS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Planes de Suscripción para Ciudades e Instituciones
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Elija el plan que mejor se adapte al tamaño y las necesidades analíticas de su entidad.
            Todos los planes garantizan anonimato diferencial y datos en tiempo real de Popayán.
          </p>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Consultando catálogo de servicios SaaS...</p>
          </div>
        )}

        {/* Estado de Error */}
        {errorMensaje && !cargando && (
          <div className="max-w-md mx-auto bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 text-center space-y-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-rose-200">{errorMensaje}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de Planes */}
        {!cargando && !errorMensaje && catalogo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {catalogo.planes.map((plan) => (
              <TarjetaPlanSaaS
                key={plan.idProducto}
                plan={plan}
                onSeleccionarPlan={handleSeleccionarPlan}
              />
            ))}
          </div>
        )}

        {/* Garantías y Seguridad Institucional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-900 text-center">
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800/80">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Privacidad Diferencial</h4>
            <p className="text-xs text-slate-400">Cumplimiento estricto de anonimato y agregación geoespacial H3.</p>
          </div>
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800/80">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Activación Síncrona</h4>
            <p className="text-xs text-slate-400">Sus módulos se habilitan inmediatamente tras la confirmación de la orden.</p>
          </div>
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800/80">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Facturación Electrónica</h4>
            <p className="text-xs text-slate-400">Soporte fiscal con NIT y comprobante con marca temporal legal.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
