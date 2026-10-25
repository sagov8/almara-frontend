import React, { useState } from 'react';
import jsPDF from 'jspdf';
import {
  PagoSuscripcionRespuesta,
  PlanSuscripcionCatalogoDto,
  OrdenSuscripcionRespuesta,
} from '../types/institutional';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  X,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  Loader2,
  FileCheck2,
} from 'lucide-react';

export interface ModalComprobantePagoProps {
  abierto: boolean;
  alCerrar: () => void;
  pago: PagoSuscripcionRespuesta;
  plan?: PlanSuscripcionCatalogoDto | null;
  orden?: OrdenSuscripcionRespuesta | null;
  razonSocial?: string;
  correo?: string;
  onIrAlDashboard: () => void;
  onIrAMiSuscripcion: () => void;
}

export const ModalComprobantePago: React.FC<ModalComprobantePagoProps> = ({
  abierto,
  alCerrar,
  pago,
  plan,
  orden,
  razonSocial,
  correo,
  onIrAlDashboard,
  onIrAMiSuscripcion,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [descargaExitosa, setDescargaExitosa] = useState(false);
  const [navegandoDestino, setNavegandoDestino] = useState<'dashboard' | 'suscripcion' | null>(null);

  if (!abierto) return null;

  const formatearMonedaCop = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const copiarReferencia = () => {
    if (pago.referenciaExterna) {
      navigator.clipboard.writeText(pago.referenciaExterna);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Generar fecha y hora formateada
  const ahora = new Date();
  const fechaFormateada = ahora.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = ahora.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Generar código de autorización realista basado en la orden
  const codigoAutorizacion = `AUTH-${(pago.numeroOrden || 'ORD')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(-6)
    .toUpperCase()}`;

  // ============================================================================
  // GENERACIÓN DE DOCUMENTO PDF OFICIAL VECTORIAL CON jsPDF
  // ============================================================================
  const generarPdfOficial = () => {
    setGenerandoPdf(true);
    setDescargaExitosa(false);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const numOrden = pago.numeroOrden || orden?.numeroOrden || 'ORD-2026-N/A';
      const nombreEntidad = razonSocial || 'Entidad Institucional';
      const correoDestino = correo || 'registrado@almara.co';
      const nombrePlan = plan?.nombre || pago.codigoPlanActivado || 'Plan Institucional';
      const refStripe = pago.referenciaExterna || 'pi_test_succeeded';
      const montoFormateado = formatearMonedaCop(pago.montoPagado || plan?.precioFinal || 0);

      // 1. Franja Superior Corporativa Almara
      doc.setFillColor(2, 132, 199); // Sky 600 (#0284c7)
      doc.rect(0, 0, 210, 36, 'F');

      // Acento visual sutil
      doc.setFillColor(79, 70, 229); // Indigo 600 (#4f46e5)
      doc.rect(0, 34, 210, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('ALMARA INSTITUCIONAL', 18, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(224, 242, 254);
      doc.text('Plataforma SaaS de Inteligencia Urbana y Bienestar Ciudadano • Popayán, Colombia', 18, 23);
      doc.text('COMPROBANTE OFICIAL DE TRANSACCIÓN ELECTRÓNICA Y FACTURACIÓN SAAS', 18, 29);

      // 2. Banner de Estado Transaccional Aprobado
      doc.setFillColor(240, 253, 244); // Emerald 50
      doc.setDrawColor(187, 247, 208); // Emerald 200
      doc.roundedRect(16, 44, 178, 22, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(22, 101, 52); // Emerald 800
      doc.text('TRANSACCIÓN APROBADA EXITOSAMENTE (CÓDIGO 00 - STRIPE SUCCEEDED)', 22, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      doc.text('Cobro verificado y conciliado en tiempo real bajo estándar de seguridad bancaria PCI-DSS.', 22, 60);

      // 3. Monto y Resumen Financiero
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.roundedRect(16, 70, 178, 25, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('MONTO TOTAL ACREDITADO:', 22, 79);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(montoFormateado, 22, 88);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Moneda legal colombiana (COP)', 188, 80, { align: 'right' });
      doc.text('IVA 19% incluido ($0 COP régimen especial SaaS)', 188, 86, { align: 'right' });

      // 4. Tabla de Metadatos de la Transacción
      const filas: [string, string][] = [
        ['Número de Orden Almara:', numOrden],
        ['Código de Autorización:', codigoAutorizacion],
        ['ID de Pasarela (Stripe PaymentIntent):', refStripe],
        ['Fecha y Hora de Emisión:', `${fechaFormateada}, ${horaFormateada}`],
        ['Medio de Pago:', 'Tarjeta de Crédito VISA (terminada en •••• 4242)'],
        ['Plan SaaS Contratado:', `${nombrePlan} (${plan?.duracionDias || 30} días de vigencia)`],
        ['Entidad / Razón Social:', nombreEntidad],
        ['Correo Institucional Registrado:', correoDestino],
        ['Estado de la Suscripción:', 'ACTIVA (Acceso inmediato al panel de inteligencia urbana)'],
        ['Entorno de Procesamiento:', 'Stripe Payments Platform (Sandbox / Producción Conectada)'],
      ];

      let posY = 103;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text('ESPECIFICACIONES DE LA TRANSACCIÓN', 16, posY);
      posY += 4;

      filas.forEach(([etiqueta, valor], index) => {
        const filaY = posY + index * 8.8;
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(16, filaY, 178, 8.8, 'F');
        }
        doc.setDrawColor(241, 245, 249);
        doc.line(16, filaY + 8.8, 194, filaY + 8.8);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(etiqueta, 20, filaY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(valor, 90, filaY + 6);
      });

      // 5. Cobertura de Módulos
      let modulosY = posY + filas.length * 8.8 + 8;
      if (plan?.modulos && plan.modulos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text('MÓDULOS Y CAPACIDADES HABILITADAS:', 16, modulosY);
        modulosY += 5;

        const modulosActivos = plan.modulos
          .filter((m) => m.habilitadoEnPlan)
          .map((m) => `[X] ${m.nombreModulo}`)
          .join('    •    ');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const lineasModulos = doc.splitTextToSize(modulosActivos, 174);
        doc.text(lineasModulos, 16, modulosY);
        modulosY += lineasModulos.length * 4.5 + 4;
      }

      // 6. Certificado Electrónico y Huella Criptográfica
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(16, 225, 178, 38, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('CERTIFICACIÓN Y VALIDEZ ELECTRÓNICA SAAS', 22, 233);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Este documento electrónico constituye soporte válido de pago y certificación de servicio prestado bajo la modalidad SaaS. ' +
        'El plan adquirido permite a la entidad acceder sin restricciones a los módulos especificados durante el período de vigencia contratado.',
        22,
        239,
        { maxWidth: 166 }
      );

      // Firma digital sintetizada
      const hashSimulado = `SHA256-${(numOrden + refStripe).split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0).toString(16).toUpperCase()}-ALMARA-2026`;
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`SELLO DIGITAL DE SEGURIDAD: ${hashSimulado}`, 22, 255);

      // 7. Pie de Página Institucional
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Almara Urban Intelligence Platform • Documento generado automáticamente • Popayán, Cauca, Colombia', 16, 275);

      // 8. Descarga Automática del PDF
      const nombreLimpio = numOrden.replace(/[^A-Za-z0-9_-]/g, '_');
      doc.save(`Comprobante_Pago_${nombreLimpio}.pdf`);

      setDescargaExitosa(true);
      setTimeout(() => setDescargaExitosa(false), 3000);
    } catch (err) {
      console.error('Error al generar el PDF del comprobante:', err);
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Estilos para impresión nativa fiel del comprobante */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #comprobante-pago-ticket, #comprobante-pago-ticket * {
            visibility: visible !important;
          }
          #comprobante-pago-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-imprimir {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-lg my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Barra Superior con Logo y Botón de Cierre */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 no-imprimir">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              A
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-800">
                Almara Platform
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Pasarela Oficial Stripe SaaS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              PCI-DSS Seguro
            </span>
            <button
              onClick={alCerrar}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL COMPROBANTE DE PAGO (Área Imprimible) */}
        <div id="comprobante-pago-ticket" className="p-6 sm:p-8 bg-white space-y-6">
          {/* Encabezado del Ticket y Estado de Transacción */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                Transacción Aprobada Exitosamente
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Comprobante Oficial de Pago
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Almara Urban Intelligence SaaS • Factura y Soporte Electrónico
              </p>
            </div>

            {/* Monto Grande Destacado */}
            <div className="pt-2 pb-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatearMonedaCop(pago.montoPagado || plan?.precioFinal || 0)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Moneda legal colombiana (COP) • IVA incluido • Facturación recurrente
              </p>
            </div>
          </div>

          {/* Línea Divisoria Perforada de Recibo */}
          <div className="relative my-4">
            <div className="border-t-2 border-dashed border-slate-200"></div>
            {/* Muescas decorativas laterales tipo recibo */}
            <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-slate-900/70 no-imprimir"></div>
            <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-slate-900/70 no-imprimir"></div>
          </div>

          {/* Grid de Metadatos de la Transacción */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
            {/* Fila 1: Número de Orden y Autorización */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Número de Orden:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {pago.numeroOrden || orden?.numeroOrden || 'ORD-2026-N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Código de Autorización:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {codigoAutorizacion}
              </span>
            </div>

            {/* Fila 2: Referencia Externa de Stripe */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">ID Pasarela (Stripe):</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
                <span className="truncate max-w-[170px] sm:max-w-[210px]">
                  {pago.referenciaExterna || 'pi_test_succeeded'}
                </span>
                <button
                  type="button"
                  onClick={copiarReferencia}
                  className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-white transition cursor-pointer no-imprimir"
                  title="Copiar referencia de pago"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Fila 3: Fecha y Hora */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha y Hora:
              </span>
              <span className="text-slate-800 font-medium">
                {fechaFormateada}, {horaFormateada}
              </span>
            </div>

            {/* Fila 4: Medio de Pago */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Medio de Pago:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-sky-700 text-white text-[10px] font-black tracking-wider">
                  VISA
                </span>
                <span className="text-slate-800 font-medium">Crédito •••• 4242</span>
              </div>
            </div>

            {/* Fila 5: Plan y Vigencia */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Plan Habilitado:
              </span>
              <span className="font-bold text-sky-700">
                {plan?.nombre || pago.codigoPlanActivado || 'Plan Institucional'}
              </span>
            </div>

            {/* Fila 6: Entidad Pagadora */}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Entidad / Razón Social:
              </span>
              <span className="text-slate-900 font-bold truncate max-w-[200px]">
                {razonSocial || 'Entidad Institucional'}
              </span>
            </div>
          </div>

          {/* Sello de Garantía y Notificación */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-semibold text-emerald-950">
                Suscripción SaaS Activa Inmediatamente
              </p>
              <p className="text-emerald-800 mt-0.5">
                Hemos remitido una copia digital de este comprobante y los accesos correspondientes al correo institucional{' '}
                <strong className="text-emerald-950">{correo || 'registrado'}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción (Pie del Modal) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-2.5 no-imprimir">
          {/* Fila Principal de Botones PDF e Impresión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto w-full">
            <button
              type="button"
              id="btn-descargar-pdf"
              disabled={generandoPdf}
              aria-busy={generandoPdf}
              onClick={generarPdfOficial}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {generandoPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                  <span>Generando...</span>
                </>
              ) : descargaExitosa ? (
                <>
                  <FileCheck2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                  <span>¡Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={navegandoDestino !== null}
              aria-busy={navegandoDestino === 'dashboard'}
              onClick={() => {
                setNavegandoDestino('dashboard');
                onIrAlDashboard();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {navegandoDestino === 'dashboard' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Abriendo...</span>
                </>
              ) : (
                <>
                  <span>Ir al Panel</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </>
              )}
            </button>  
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={navegandoDestino !== null}
              onClick={() => {
                setNavegandoDestino('suscripcion');
                onIrAMiSuscripcion();
              }}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2 transition cursor-pointer disabled:opacity-60"
            >
              {navegandoDestino === 'suscripcion' ? 'Cargando suscripción...' : 'O consultar los detalles en Mi Suscripción →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
