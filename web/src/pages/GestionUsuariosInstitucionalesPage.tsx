import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  KeyRound,
  ArrowLeft,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuthAdmin } from '../context/AuthAdminContext';
import {
  InstitucionAdminResumen,
  PlanAdminResumen,
  EstadoCuentaInstitucional,
} from '../types/admin';
import {
  listarInstitucionesAdmin,
  listarPlanesDisponiblesAdmin,
  aprobarInstitucionAdmin,
  suspenderInstitucionAdmin,
  darDeBajaInstitucionAdmin,
  reactivarInstitucionAdmin,
  revocarSesionesInstitucionAdmin,
} from '../services/apiAdmin';

export const GestionUsuariosInstitucionalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuthAdmin();
  const token = sesion?.token;

  const [instituciones, setInstituciones] = useState<InstitucionAdminResumen[]>([]);
  const [planes, setPlanes] = useState<PlanAdminResumen[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState<InstitucionAdminResumen | null>(null);
  const [modalAprobar, setModalAprobar] = useState<boolean>(false);
  const [modalSuspender, setModalSuspender] = useState<boolean>(false);
  const [modalBaja, setModalBaja] = useState<boolean>(false);
  const [modalReactivar, setModalReactivar] = useState<boolean>(false);
  const [modalDetalle, setModalDetalle] = useState<boolean>(false);

  // Campos de formulario modal
  const [planSeleccionado, setPlanSeleccionado] = useState<string>('PLAN_FREE');
  const [motivoModal, setMotivoModal] = useState<string>('');
  const [procesandoAccion, setProcesandoAccion] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    cargarDatos();
  }, [token]);

  const cargarDatos = async () => {
    if (!token) return;
    setCargando(true);
    setErrorGlobal(null);
    try {
      const [listaInst, listaPlanes] = await Promise.all([
        listarInstitucionesAdmin(token),
        listarPlanesDisponiblesAdmin(token),
      ]);
      setInstituciones(listaInst);
      setPlanes(listaPlanes);
    } catch (err: any) {
      setErrorGlobal(err.mensaje || 'Error al sincronizar las instituciones con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const institucionesFiltradas = instituciones.filter((inst) => {
    if (filtroEstado !== 'TODOS' && inst.estadoCuenta !== filtroEstado) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchRazon = inst.razonSocial.toLowerCase().includes(q);
      const matchNit = inst.identificacionFiscalNit.toLowerCase().includes(q);
      const matchEmail = inst.correo.toLowerCase().includes(q);
      return matchRazon || matchNit || matchEmail;
    }
    return true;
  });

  const conteoPendientes = instituciones.filter((i) => i.estadoCuenta === 'PENDIENTE_APROBACION').length;
  const conteoActivas = instituciones.filter((i) => i.estadoCuenta === 'ACTIVA').length;
  const conteoSuspendidas = instituciones.filter((i) => i.estadoCuenta === 'SUSPENDIDA').length;
  const conteoInactivas = instituciones.filter((i) => i.estadoCuenta === 'INACTIVA').length;

  // Acciones
  const abrirAprobar = (inst: InstitucionAdminResumen) => {
    setInstitucionSeleccionada(inst);
    setPlanSeleccionado('PLAN_STANDARD');
    setMotivoModal('');
    setErrorModal(null);
    setModalAprobar(true);
  };

  const ejecutarAprobar = async () => {
    if (!token || !institucionSeleccionada) return;
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await aprobarInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        codigoPlan: planSeleccionado,
        motivo: motivoModal || undefined,
      });
      setInstituciones((prev) =>
        prev.map((item) => (item.idInstitucion === actualizada.idInstitucion ? actualizada : item))
      );
      setMensajeExito(`Cuenta de [${actualizada.razonSocial}] aprobada exitosamente y plan asignado.`);
      setModalAprobar(false);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'No fue posible aprobar la cuenta institucional.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirSuspender = (inst: InstitucionAdminResumen) => {
    setInstitucionSeleccionada(inst);
    setMotivoModal('');
    setErrorModal(null);
    setModalSuspender(true);
  };

  const ejecutarSuspender = async () => {
    if (!token || !institucionSeleccionada) return;
    if (!motivoModal.trim()) {
      setErrorModal('Debe ingresar un motivo obligatorio para suspender la cuenta institucional.');
      return;
    }
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await suspenderInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        motivo: motivoModal.trim(),
      });
      setInstituciones((prev) =>
        prev.map((item) => (item.idInstitucion === actualizada.idInstitucion ? actualizada : item))
      );
      setMensajeExito(`Cuenta de [${actualizada.razonSocial}] suspendida. Sus sesiones activas han sido revocadas.`);
      setModalSuspender(false);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'No fue posible suspender la institución.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirBaja = (inst: InstitucionAdminResumen) => {
    setInstitucionSeleccionada(inst);
    setMotivoModal('');
    setErrorModal(null);
    setModalBaja(true);
  };

  const ejecutarBaja = async () => {
    if (!token || !institucionSeleccionada) return;
    if (!motivoModal.trim()) {
      setErrorModal('Debe ingresar un motivo formal de cancelación/baja.');
      return;
    }
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await darDeBajaInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        motivo: motivoModal.trim(),
      });
      setInstituciones((prev) =>
        prev.map((item) => (item.idInstitucion === actualizada.idInstitucion ? actualizada : item))
      );
      setMensajeExito(`Cuenta de [${actualizada.razonSocial}] dada de baja definitiva en el sistema.`);
      setModalBaja(false);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'No fue posible dar de baja a la institución.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirReactivar = (inst: InstitucionAdminResumen) => {
    setInstitucionSeleccionada(inst);
    setMotivoModal('');
    setErrorModal(null);
    setModalReactivar(true);
  };

  const ejecutarReactivar = async () => {
    if (!token || !institucionSeleccionada) return;
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await reactivarInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        motivo: motivoModal || undefined,
      });
      setInstituciones((prev) =>
        prev.map((item) => (item.idInstitucion === actualizada.idInstitucion ? actualizada : item))
      );
      setMensajeExito(`Cuenta de [${actualizada.razonSocial}] reactivada satisfactoriamente.`);
      setModalReactivar(false);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'No fue posible reactivar la institución.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const ejecutarRevocarSesiones = async (inst: InstitucionAdminResumen) => {
    if (!token) return;
    if (!window.confirm(`¿Revocar inmediatamente todas las sesiones concurrentes de [${inst.razonSocial}]?`)) {
      return;
    }
    try {
      await revocarSesionesInstitucionAdmin(token, inst.idInstitucion, {
        motivo: 'Revocación de seguridad ejecutada por administrador desde panel',
      });
      setMensajeExito(`Todas las sesiones de [${inst.razonSocial}] han sido invalidadas en tiempo real.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorGlobal(err.mensaje || 'Error al revocar las sesiones activas.');
    }
  };

  const renderBadgeEstado = (estado: EstadoCuentaInstitucional) => {
    switch (estado) {
      case 'PENDIENTE_APROBACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente Aprobación
          </span>
        );
      case 'ACTIVA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Activa
          </span>
        );
      case 'SUSPENDIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Suspendida
          </span>
        );
      case 'INACTIVA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Inactiva / Baja
          </span>
        );
    }
  };

  const renderBadgePlan = (codigoPlan?: string) => {
    switch (codigoPlan) {
      case 'PLAN_ENTERPRISE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Zap className="w-3 h-3 text-purple-600" /> Enterprise
          </span>
        );
      case 'PLAN_STANDARD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <BadgeCheck className="w-3 h-3 text-sky-600" /> Estándar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Freemium
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8 font-sans">
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-7 h-7 text-indigo-600" />
                  Gestión de Usuarios Institucionales
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Aprobación de cuentas corporativas, suspensión, baja, revocación de sesiones JWT y notificaciones (HU-15)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-indigo-600' : ''}`} />
              Sincronizar
            </button>
            <button
              onClick={async () => {
                await cerrarSesion();
                navigate('/admin/login');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl border border-slate-200 hover:border-rose-200 text-sm font-medium transition-colors shadow-sm cursor-pointer"
              title="Cerrar sesión de administrador (HU-18)"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Alertas */}
        {mensajeExito && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span className="text-sm font-medium">{mensajeExito}</span>
            </div>
            <button onClick={() => setMensajeExito(null)} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorGlobal && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span className="text-sm font-medium">{errorGlobal}</span>
            </div>
            <button onClick={() => setErrorGlobal(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Entidades</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{instituciones.length}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('PENDIENTE_APROBACION')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filtroEstado === 'PENDIENTE_APROBACION'
                ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-300/40 shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendientes
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{conteoPendientes}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('ACTIVA')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filtroEstado === 'ACTIVA'
                ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-300/40 shadow-sm'
                : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Activas
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{conteoActivas}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('SUSPENDIDA')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filtroEstado === 'SUSPENDIDA'
                ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-300/40 shadow-sm'
                : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Suspendidas / Bajas
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">{conteoSuspendidas + conteoInactivas}</div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['TODOS', 'PENDIENTE_APROBACION', 'ACTIVA', 'SUSPENDIDA', 'INACTIVA'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filtroEstado === estado
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {estado === 'TODOS'
                  ? 'Todas'
                  : estado === 'PENDIENTE_APROBACION'
                  ? 'Pendientes'
                  : estado === 'ACTIVA'
                  ? 'Activas'
                  : estado === 'SUSPENDIDA'
                  ? 'Suspendidas'
                  : 'Inactivas'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Razón Social, NIT o Correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Tabla de Instituciones */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {cargando ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span>Cargando directorio de cuentas institucionales...</span>
            </div>
          ) : institucionesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No se encontraron cuentas institucionales con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Entidad / Razón Social</th>
                    <th className="py-3 px-4">Contacto / Email</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Plan SaaS</th>
                    <th className="py-3 px-4 text-right">Acciones de Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {institucionesFiltradas.map((inst) => (
                    <tr key={inst.idInstitucion} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inst.razonSocial}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>NIT: {inst.identificacionFiscalNit}</span>
                          {inst.sectorActividad && (
                            <span className="text-indigo-600 font-medium">• {inst.sectorActividad.replace(/_/g, ' ')}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 text-xs font-semibold">{inst.nombreContacto}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{inst.correo}</span>
                          {inst.correoVerificado ? (
                            <span title="Correo corporativo verificado">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          ) : (
                            <span title="Pendiente verificación">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                            </span>
                          )}
                        </div>
                        {inst.telefonoContacto && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inst.telefonoContacto}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {renderBadgeEstado(inst.estadoCuenta)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{renderBadgePlan(inst.codigoPlan)}</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">
                          {inst.nombrePlan || 'Plan Básico (Free)'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detalle */}
                          <button
                            onClick={() => {
                              setInstitucionSeleccionada(inst);
                              setModalDetalle(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Ver Detalle Institucional"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Aprobar */}
                          {inst.estadoCuenta === 'PENDIENTE_APROBACION' && (
                            <button
                              onClick={() => abrirAprobar(inst)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                              title="Aprobar Cuenta y Asignar Plan"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Aprobar
                            </button>
                          )}

                          {/* Suspender */}
                          {inst.estadoCuenta === 'ACTIVA' && (
                            <button
                              onClick={() => abrirSuspender(inst)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                              title="Suspender Cuenta Temporalmente"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Suspender
                            </button>
                          )}

                          {/* Reactivar */}
                          {(inst.estadoCuenta === 'SUSPENDIDA' || inst.estadoCuenta === 'INACTIVA') && (
                            <button
                              onClick={() => abrirReactivar(inst)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                              title="Reactivar Cuenta a Estado ACTIVA"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reactivar
                            </button>
                          )}

                          {/* Dar de Baja */}
                          {inst.estadoCuenta !== 'INACTIVA' && (
                            <button
                              onClick={() => abrirBaja(inst)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                              title="Dar de Baja Definitiva"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {/* Revocar Sesiones Activas */}
                          {inst.estadoCuenta === 'ACTIVA' && (
                            <button
                              onClick={() => ejecutarRevocarSesiones(inst)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                              title="Revocar todas las sesiones JWT activas"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: APROBAR CUENTA INSTITUCIONAL */}
      {/* ========================================================================= */}
      {modalAprobar && institucionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Aprobar Cuenta Institucional</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Asignación de plan SaaS y activación de acceso</p>
                </div>
              </div>
              <button
                onClick={() => setModalAprobar(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Entidad a Aprobar:</div>
                <div className="font-bold text-slate-900 text-sm">{institucionSeleccionada.razonSocial}</div>
                <div className="text-slate-500">NIT: {institucionSeleccionada.identificacionFiscalNit} • Correo: {institucionSeleccionada.correo}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Plan SaaS a Asignar <span className="text-indigo-600">*</span>
                </label>
                <select
                  value={planSeleccionado}
                  onChange={(e) => setPlanSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                >
                  {planes.map((p) => (
                    <option key={p.idProducto} value={p.codigo}>
                      {p.nombre} ({p.tipoPlan} - ${p.precioBase.toLocaleString('es-CO')} COP / {p.duracionDias} días)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Se creará la suscripción institucional con vigencia y permisos según la matriz SaaS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Justificación o Nota Administrativa (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Aprobado tras firma de convenio interadministrativo..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-sky-600" />
                <span>Se enviará automáticamente un correo electrónico SMTP de confirmación a la entidad.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalAprobar(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarAprobar}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {procesandoAccion ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Confirmar Aprobación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUSPENDER CUENTA */}
      {/* ========================================================================= */}
      {modalSuspender && institucionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Suspender Cuenta Institucional</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pausa temporal de acceso y revocación inmediata de sesiones</p>
                </div>
              </div>
              <button onClick={() => setModalSuspender(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Entidad:</div>
                <div className="font-bold text-slate-900">{institucionSeleccionada.razonSocial}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Motivo o Justificación de Suspensión <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Incumplimiento de pago de factura estándar mes de octubre..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Efectos de la suspensión:
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-xs">
                  <li>Invalida de inmediato todos los tokens JWT emitidos en la lista negra.</li>
                  <li>Expulsa cualquier sesión activa del dashboard analítico.</li>
                  <li>Notifica por correo a la entidad con el motivo formal.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalSuspender(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarSuspender}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {procesandoAccion ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Confirmar Suspensión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DAR DE BAJA DEFINITIVA */}
      {/* ========================================================================= */}
      {modalBaja && institucionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dar de Baja Cuenta</h3>
                  <p className="text-xs text-rose-600 mt-0.5 font-medium">Cancelación definitiva de acceso institucional</p>
                </div>
              </div>
              <button onClick={() => setModalBaja(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Entidad a Cancelar:</div>
                <div className="font-bold text-slate-900">{institucionSeleccionada.razonSocial}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Motivo de Baja o Cancelación Contractual <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Solicitud expresa de la entidad por terminación de contrato..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Acción irreversible inmediata:
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Se cancela la suscripción activa, se revoca cualquier sesión concurrente y se notifica la baja formal por correo.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalBaja(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarBaja}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {procesandoAccion ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Confirmar Baja Definitiva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REACTIVAR CUENTA */}
      {/* ========================================================================= */}
      {modalReactivar && institucionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reactivar Cuenta Institucional</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Restablecer estado ACTIVA y notificar por correo</p>
                </div>
              </div>
              <button onClick={() => setModalReactivar(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Entidad a Reactivar:</div>
                <div className="font-bold text-slate-900">{institucionSeleccionada.razonSocial}</div>
                <div className="text-slate-500">Estado actual: {institucionSeleccionada.estadoCuenta}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Motivo de Reactivación (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Pago verificado y regularizado satisfactoriamente..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalReactivar(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarReactivar}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {procesandoAccion ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmar Reactivación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETALLE INSTITUCIONAL COMPLETO */}
      {/* ========================================================================= */}
      {modalDetalle && institucionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Perfil Corporativo Institucional</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Identificador ID: {institucionSeleccionada.idInstitucion}</p>
                </div>
              </div>
              <button onClick={() => setModalDetalle(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-slate-500">Razón Social:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{institucionSeleccionada.razonSocial}</div>
                </div>
                <div>
                  <div className="text-slate-500">NIT Fiscal:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{institucionSeleccionada.identificacionFiscalNit}</div>
                </div>

                <div>
                  <div className="text-slate-500">Correo Electrónico:</div>
                  <div className="text-slate-800 font-medium mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{institucionSeleccionada.correo}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Teléfono:</div>
                  <div className="text-slate-800 font-medium mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{institucionSeleccionada.telefonoContacto || 'No registrado'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Representante Contacto:</div>
                  <div className="text-slate-800 font-medium mt-0.5">{institucionSeleccionada.nombreContacto}</div>
                </div>
                <div>
                  <div className="text-slate-500">Sector de Actividad:</div>
                  <div className="text-slate-800 font-medium mt-0.5">{institucionSeleccionada.sectorActividad || 'General'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-slate-500">Estado de Cuenta:</div>
                  <div className="mt-1">{renderBadgeEstado(institucionSeleccionada.estadoCuenta)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Plan Asignado:</div>
                  <div className="mt-1 flex items-center gap-2">
                    {renderBadgePlan(institucionSeleccionada.codigoPlan)}
                    <span className="text-slate-700 font-semibold">{institucionSeleccionada.nombrePlan}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Fecha de Registro:</div>
                  <div className="text-slate-800 mt-0.5">
                    {new Date(institucionSeleccionada.fechaRegistro).toLocaleString('es-CO')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Vencimiento Suscripción:</div>
                  <div className="text-slate-800 mt-0.5 font-medium">
                    {institucionSeleccionada.fechaExpiracionSuscripcion
                      ? new Date(institucionSeleccionada.fechaExpiracionSuscripcion).toLocaleDateString('es-CO')
                      : 'Indefinida / Sin suscripción activa'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
