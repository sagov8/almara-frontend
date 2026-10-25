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
} from 'lucide-react';
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
  const token = localStorage.getItem('almara_admin_token');

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
      const matchContacto = inst.nombreContacto.toLowerCase().includes(q);
      return matchRazon || matchNit || matchEmail || matchContacto;
    }
    return true;
  });

  const conteoPendientes = instituciones.filter((i) => i.estadoCuenta === 'PENDIENTE_APROBACION').length;
  const conteoActivas = instituciones.filter((i) => i.estadoCuenta === 'ACTIVA').length;
  const conteoSuspendidas = instituciones.filter((i) => i.estadoCuenta === 'SUSPENDIDA').length;
  const conteoInactivas = instituciones.filter((i) => i.estadoCuenta === 'INACTIVA').length;

  const abrirAprobar = (inst: InstitucionAdminResumen) => {
    setInstitucionSeleccionada(inst);
    setPlanSeleccionado(inst.codigoPlan || 'PLAN_STANDARD');
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
        motivo: motivoModal.trim() || undefined,
      });
      setInstituciones((prev) =>
        prev.map((i) => (i.idInstitucion === actualizada.idInstitucion ? actualizada : i))
      );
      setModalAprobar(false);
      setMensajeExito(`Cuenta institucional [${actualizada.razonSocial}] aprobada exitosamente.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'Error al aprobar la cuenta institucional.');
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
      setErrorModal('Debe ingresar un motivo para suspender la cuenta.');
      return;
    }
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await suspenderInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        motivo: motivoModal.trim(),
      });
      setInstituciones((prev) =>
        prev.map((i) => (i.idInstitucion === actualizada.idInstitucion ? actualizada : i))
      );
      setModalSuspender(false);
      setMensajeExito(`Cuenta [${actualizada.razonSocial}] suspendida y sesiones revocadas de inmediato.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'Error al suspender la cuenta institucional.');
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
      setErrorModal('Debe ingresar el motivo de cancelación o baja definitiva.');
      return;
    }
    setProcesandoAccion(true);
    setErrorModal(null);
    try {
      const actualizada = await darDeBajaInstitucionAdmin(token, institucionSeleccionada.idInstitucion, {
        motivo: motivoModal.trim(),
      });
      setInstituciones((prev) =>
        prev.map((i) => (i.idInstitucion === actualizada.idInstitucion ? actualizada : i))
      );
      setModalBaja(false);
      setMensajeExito(`Cuenta [${actualizada.razonSocial}] dada de baja definitivamente.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'Error al dar de baja la cuenta.');
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
        motivo: motivoModal.trim() || undefined,
      });
      setInstituciones((prev) =>
        prev.map((i) => (i.idInstitucion === actualizada.idInstitucion ? actualizada : i))
      );
      setModalReactivar(false);
      setMensajeExito(`Cuenta institucional [${actualizada.razonSocial}] reactivada a estado ACTIVA.`);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err: any) {
      setErrorModal(err.mensaje || 'Error al reactivar la cuenta.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const ejecutarRevocarSesiones = async (inst: InstitucionAdminResumen) => {
    if (!token) return;
    if (!confirm(`¿Confirma revocar de inmediato todos los tokens JWT y sesiones activas de [${inst.razonSocial}]?`)) {
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pendiente Aprobación
          </span>
        );
      case 'ACTIVA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Activa
          </span>
        );
      case 'SUSPENDIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Suspendida
          </span>
        );
      case 'INACTIVA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Inactiva / Baja
          </span>
        );
    }
  };

  const renderBadgePlan = (codigoPlan?: string) => {
    switch (codigoPlan) {
      case 'PLAN_ENTERPRISE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Zap className="w-3 h-3 text-purple-400" /> Enterprise
          </span>
        );
      case 'PLAN_STANDARD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <BadgeCheck className="w-3 h-3 text-blue-400" /> Estándar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30">
            Freemium
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-7 h-7 text-indigo-400" />
                  Gestión de Usuarios Institucionales
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Aprobación de cuentas corporativas, suspensión, baja, revocación de sesiones JWT y notificaciones (HU-15)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-indigo-400' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Alertas */}
        {mensajeExito && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm">{mensajeExito}</span>
            </div>
            <button onClick={() => setMensajeExito(null)} className="text-emerald-400 hover:text-emerald-200">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorGlobal && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span className="text-sm">{errorGlobal}</span>
            </div>
            <button onClick={() => setErrorGlobal(null)} className="text-rose-400 hover:text-rose-200">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Entidades</div>
            <div className="text-2xl font-bold text-white mt-1">{instituciones.length}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('PENDIENTE_APROBACION')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              filtroEstado === 'PENDIENTE_APROBACION'
                ? 'bg-amber-500/20 border-amber-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
            }`}
          >
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pendientes
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{conteoPendientes}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('ACTIVA')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              filtroEstado === 'ACTIVA'
                ? 'bg-emerald-500/20 border-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/30'
            }`}
          >
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Activas
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{conteoActivas}</div>
          </div>

          <div
            onClick={() => setFiltroEstado('SUSPENDIDA')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              filtroEstado === 'SUSPENDIDA'
                ? 'bg-rose-500/20 border-rose-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-rose-500/30'
            }`}
          >
            <div className="text-xs font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Suspendidas / Bajas
            </div>
            <div className="text-2xl font-bold text-rose-300 mt-1">{conteoSuspendidas + conteoInactivas}</div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['TODOS', 'PENDIENTE_APROBACION', 'ACTIVA', 'SUSPENDIDA', 'INACTIVA'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Razón Social, NIT o Correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tabla de Instituciones */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          {cargando ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span>Cargando directorio de cuentas institucionales...</span>
            </div>
          ) : institucionesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No se encontraron cuentas institucionales con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Entidad / Razón Social</th>
                    <th className="py-3 px-4">Contacto / Email</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Plan SaaS</th>
                    <th className="py-3 px-4 text-right">Acciones de Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {institucionesFiltradas.map((inst) => (
                    <tr key={inst.idInstitucion} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{inst.razonSocial}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>NIT: {inst.identificacionFiscalNit}</span>
                          {inst.sectorActividad && (
                            <span className="text-indigo-400/80">• {inst.sectorActividad.replace(/_/g, ' ')}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 text-xs font-medium">{inst.nombreContacto}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{inst.correo}</span>
                          {inst.correoVerificado ? (
                            <span title="Correo corporativo verificado">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                            </span>
                          ) : (
                            <span title="Pendiente verificación">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                        </div>
                        {inst.telefonoContacto && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-600" />
                            <span>{inst.telefonoContacto}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {renderBadgeEstado(inst.estadoCuenta)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{renderBadgePlan(inst.codigoPlan)}</div>
                        <div className="text-xs text-slate-500 mt-1">
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
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                            title="Ver Detalle Institucional"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Aprobar */}
                          {inst.estadoCuenta === 'PENDIENTE_APROBACION' && (
                            <button
                              onClick={() => abrirAprobar(inst)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
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
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/40 transition-colors"
                              title="Dar de Baja Definitiva"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {/* Revocar Sesiones Activas */}
                          {inst.estadoCuenta === 'ACTIVA' && (
                            <button
                              onClick={() => ejecutarRevocarSesiones(inst)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700/60 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aprobar Cuenta Institucional</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Asignación de plan SaaS y activación de acceso</p>
                </div>
              </div>
              <button
                onClick={() => setModalAprobar(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Entidad a Aprobar:</div>
                <div className="font-semibold text-slate-100 text-sm">{institucionSeleccionada.razonSocial}</div>
                <div className="text-slate-400">NIT: {institucionSeleccionada.identificacionFiscalNit} • Correo: {institucionSeleccionada.correo}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Plan SaaS a Asignar <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={planSeleccionado}
                  onChange={(e) => setPlanSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Justificación o Nota Administrativa (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Aprobado tras firma de convenio interadministrativo..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <span>Se enviará automáticamente un correo electrónico SMTP de confirmación a la entidad.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalAprobar(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarAprobar}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Suspender Cuenta Institucional</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pausa temporal de acceso y revocación inmediata de sesiones</p>
                </div>
              </div>
              <button onClick={() => setModalSuspender(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Entidad:</div>
                <div className="font-semibold text-slate-100">{institucionSeleccionada.razonSocial}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Motivo o Justificación de Suspensión <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Incumplimiento de pago de factura estándar mes de octubre..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Efectos de la suspensión:
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-xs">
                  <li>Invalida de inmediato todos los tokens JWT emitidos en la lista negra.</li>
                  <li>Expulsa cualquier sesión activa del dashboard analítico.</li>
                  <li>Notifica por correo a la entidad con el motivo formal.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalSuspender(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarSuspender}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dar de Baja Cuenta</h3>
                  <p className="text-xs text-rose-400 mt-0.5">Cancelación definitiva de acceso institucional</p>
                </div>
              </div>
              <button onClick={() => setModalBaja(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Entidad a Cancelar:</div>
                <div className="font-semibold text-slate-100">{institucionSeleccionada.razonSocial}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Motivo de Baja o Cancelación Contractual <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Solicitud expresa de la entidad por terminación de contrato..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Acción irreversible inmediata:
                </div>
                <p className="text-slate-300 text-xs">
                  Se cancela la suscripción activa, se revoca cualquier sesión concurrente y se notifica la baja formal por correo.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalBaja(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarBaja}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reactivar Cuenta Institucional</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Restablecer estado ACTIVA y notificar por correo</p>
                </div>
              </div>
              <button onClick={() => setModalReactivar(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Entidad a Reactivar:</div>
                <div className="font-semibold text-slate-100">{institucionSeleccionada.razonSocial}</div>
                <div className="text-slate-400">Estado actual: {institucionSeleccionada.estadoCuenta}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Motivo de Reactivación (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={motivoModal}
                  onChange={(e) => setMotivoModal(e.target.value)}
                  placeholder="Ej. Pago verificado y regularizado satisfactoriamente..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalReactivar(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarReactivar}
                disabled={procesandoAccion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Perfil Corporativo Institucional</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Identificador ID: {institucionSeleccionada.idInstitucion}</p>
                </div>
              </div>
              <button onClick={() => setModalDetalle(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400">Razón Social:</div>
                  <div className="font-semibold text-slate-100 text-sm mt-0.5">{institucionSeleccionada.razonSocial}</div>
                </div>
                <div>
                  <div className="text-slate-400">NIT Fiscal:</div>
                  <div className="font-semibold text-slate-100 text-sm mt-0.5">{institucionSeleccionada.identificacionFiscalNit}</div>
                </div>

                <div>
                  <div className="text-slate-400">Correo Electrónico:</div>
                  <div className="text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{institucionSeleccionada.correo}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Teléfono:</div>
                  <div className="text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{institucionSeleccionada.telefonoContacto || 'No registrado'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Representante Contacto:</div>
                  <div className="text-slate-200 mt-0.5">{institucionSeleccionada.nombreContacto}</div>
                </div>
                <div>
                  <div className="text-slate-400">Sector de Actividad:</div>
                  <div className="text-slate-200 mt-0.5">{institucionSeleccionada.sectorActividad || 'General'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400">Estado de Cuenta:</div>
                  <div className="mt-1">{renderBadgeEstado(institucionSeleccionada.estadoCuenta)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Plan Asignado:</div>
                  <div className="mt-1 flex items-center gap-2">
                    {renderBadgePlan(institucionSeleccionada.codigoPlan)}
                    <span className="text-slate-300 font-medium">{institucionSeleccionada.nombrePlan}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Fecha de Registro:</div>
                  <div className="text-slate-200 mt-0.5">
                    {new Date(institucionSeleccionada.fechaRegistro).toLocaleString('es-CO')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Vencimiento Suscripción:</div>
                  <div className="text-slate-200 mt-0.5">
                    {institucionSeleccionada.fechaExpiracionSuscripcion
                      ? new Date(institucionSeleccionada.fechaExpiracionSuscripcion).toLocaleDateString('es-CO')
                      : 'Indefinida / Sin suscripción activa'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
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
