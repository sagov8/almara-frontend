import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

  const cargarPlanes = useCallback(async () => {
    setCargando(true);
    setErrorMensaje(null);
    try {
      const respuesta = await consultarCatalogoPlanes(sesion?.tokenAcceso);
      setCatalogo(respuesta);
    } catch (err: unknown) {
      const apiErr = err as { mensaje?: string };
      setErrorMensaje(apiErr?.mensaje || 'No fue posible cargar el catálogo de planes SaaS.');
    } finally {
      setCargando(false);
    }
  }, [sesion?.tokenAcceso]);

  useEffect(() => {
    cargarPlanes();
  }, [cargarPlanes]);

  const handleSeleccionarPlan = (codigoPlan: string) => {
    navigate(`/institutional/checkout?plan=${codigoPlan}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <NavbarInstitucional />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Cabecera Principal */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-sky-50 border border-sky-200 text-sky-700 uppercase tracking-widest">
            Catálogo Comercial Almara SaaS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Planes de Suscripción para Ciudades e Instituciones
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Elija el plan que mejor se adapte al tamaño y las necesidades analíticas de su entidad.
            Todos los planes garantizan anonimato diferencial y datos en tiempo real de Popayán.
          </p>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Consultando catálogo de servicios SaaS...</p>
          </div>
        )}

        {/* Estado de Error */}
        {errorMensaje && !cargando && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-rose-700 font-medium">{errorMensaje}</p>
            <button
              onClick={cargarPlanes}
              disabled={cargando}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              {cargando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reintentar</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 text-center">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Privacidad Diferencial</h4>
            <p className="text-xs text-slate-600">Cumplimiento estricto de anonimato y agregación geoespacial H3.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Activación Síncrona</h4>
            <p className="text-xs text-slate-600">Sus módulos se habilitan inmediatamente tras la confirmación de la orden.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Facturación Oficial</h4>
            <p className="text-xs text-slate-600">Soporte fiscal con NIT y comprobante con marca temporal legal.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
