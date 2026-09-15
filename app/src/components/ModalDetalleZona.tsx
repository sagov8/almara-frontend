import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  X,
  TrendingUp,
  Users,
  Clock,
  MessageSquare,
  Shield,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import {
  DetalleZonaEmocionRespuesta,
  consultarDetalleZona,
} from '../services/servicioMapa';
import { IconoEmocion } from './IconoEmocion';
import { LISTA_EMOCIONES } from '../constants/emociones';

export type TipoPeriodoTemporal = 'ULTIMAS_2_HORAS' | 'ULTIMAS_24_HORAS' | 'HOY';

interface OpcionPeriodo {
  clave: TipoPeriodoTemporal;
  etiqueta: string;
}

const OPCIONES_PERIODO: OpcionPeriodo[] = [
  { clave: 'ULTIMAS_2_HORAS', etiqueta: 'Últimas 2 horas' },
  { clave: 'ULTIMAS_24_HORAS', etiqueta: 'Últimas 24 horas' },
  { clave: 'HOY', etiqueta: 'Hoy' },
];

interface PropiedadesModalDetalleZona {
  visible: boolean;
  idCeldaH3: string | null;
  nombreZonaInicial?: string;
  onCerrar: () => void;
}

/**
 * Modal accesible de Detalle Emocional de Zona (HU-06).
 * Presenta el desglose del 100% de emociones mediante el algoritmo de Hamilton-Hare,
 * tendencia barrial, participantes aproximados (sin exponer cifras individuales),
 * comentarios moderados de la comunidad y explicaciones ciudadanas de privacidad.
 */
export const ModalDetalleZona: React.FC<PropiedadesModalDetalleZona> = ({
  visible,
  idCeldaH3,
  nombreZonaInicial = 'Zona de Popayán',
  onCerrar,
}) => {
  const [periodoActivo, setPeriodoActivo] = useState<TipoPeriodoTemporal>('ULTIMAS_2_HORAS');
  const [cargando, setCargando] = useState<boolean>(false);
  const [detalle, setDetalle] = useState<DetalleZonaEmocionRespuesta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && idCeldaH3) {
      cargarDetalleZona(idCeldaH3, periodoActivo);
    } else if (!visible) {
      setDetalle(null);
      setError(null);
    }
  }, [visible, idCeldaH3, periodoActivo]);

  const cargarDetalleZona = async (celdaId: string, periodo: TipoPeriodoTemporal) => {
    setCargando(true);
    setError(null);
    try {
      const data = await consultarDetalleZona(celdaId, periodo);
      setDetalle(data);
    } catch (err) {
      console.error('Error cargando detalle de zona:', err);
      setError('No fue posible cargar el detalle en este momento.');
    } finally {
      setCargando(false);
    }
  };

  if (!visible) return null;

  const nombreZona = detalle?.nombreZona || nombreZonaInicial;
  const cumpleUmbral = detalle ? detalle.cumpleUmbral : true;

  // Mapear distribución para ordenar y presentar
  const emocionesConPorcentaje = LISTA_EMOCIONES.map((emo) => {
    const pct = detalle?.distribucionPorcentajes?.[emo.id] ?? 0;
    return {
      ...emo,
      porcentaje: pct,
    };
  }).sort((a, b) => b.porcentaje - a.porcentaje);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={estilos.overlay}>
        <View style={estilos.tarjetaPrincipal}>
          {/* Cabecera del Modal con Iconos Lucide */}
          <View style={estilos.cabecera}>
            <View style={estilos.infoTitulo}>
              <View
                style={[
                  estilos.circuloPredominante,
                  {
                    backgroundColor: detalle?.codigoHexFondo || '#F1F5F9',
                    borderColor: detalle?.codigoHexColor || '#CBD5E1',
                  },
                ]}
              >
                <IconoEmocion
                  emocion={detalle?.emocionPredominante || 'PROTEGIDA'}
                  color={detalle?.codigoHexColor || '#0284C7'}
                  size={24}
                />
              </View>
              <View style={estilos.contenedorNombre}>
                <Text style={estilos.tituloZona} numberOfLines={1}>
                  {nombreZona}
                </Text>
                <Text
                  style={[
                    estilos.subtituloEmocion,
                    { color: detalle?.codigoHexColor || '#64748B' },
                  ]}
                >
                  {cumpleUmbral
                    ? `Predomina: ${detalle?.nombreEmocion || 'Analizando...'}`
                    : 'Zona en reserva ciudadana'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={estilos.botonCerrar}
              onPress={onCerrar}
              activeOpacity={0.7}
              accessibilityLabel="Cerrar detalle de zona"
            >
              <X size={20} color="#64748B" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Selector de Período Temporal */}
          <View style={estilos.contenedorFiltros}>
            {OPCIONES_PERIODO.map((item) => {
              const activo = periodoActivo === item.clave;
              return (
                <TouchableOpacity
                  key={item.clave}
                  style={[
                    estilos.pildoraFiltro,
                    activo && estilos.pildoraFiltroActiva,
                  ]}
                  onPress={() => setPeriodoActivo(item.clave)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      estilos.textoPildora,
                      activo && estilos.textoPildoraActiva,
                    ]}
                  >
                    {item.etiqueta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Contenido desplazable */}
          <ScrollView
            style={estilos.scroll}
            contentContainerStyle={estilos.scrollContenido}
            showsVerticalScrollIndicator={false}
          >
            {cargando ? (
              <View style={estilos.cajaCarga}>
                <ActivityIndicator size="large" color="#0284C7" />
                <Text style={estilos.textoCargando}>
                  Calculando balance emocional del sector...
                </Text>
              </View>
            ) : error ? (
              <View style={estilos.cajaError}>
                <Text style={estilos.textoError}>{error}</Text>
              </View>
            ) : !cumpleUmbral ? (
              /* Caso de reserva ciudadana (menos del umbral mínimo de vecinos) */
              <View style={estilos.cajaReserva}>
                <View style={estilos.iconoReservaGrande}>
                  <Lock size={32} color="#D97706" strokeWidth={2.2} />
                </View>
                <Text style={estilos.tituloReserva}>Zona en Reserva Ciudadana</Text>
                <Text style={estilos.descripcionReserva}>
                  Esta zona cuenta con menos de 5 reportes en este período.
                  Para garantizar que nadie pueda identificar las emociones de una sola persona,
                  el detalle se revelará colectivamente cuando más vecinos compartan su sentir.
                </Text>

                <View style={estilos.cajaNotaComunidad}>
                  <Shield size={16} color="#166534" strokeWidth={2.2} />
                  <Text style={estilos.textoNotaComunidad}>
                    Tu participación se suma de forma segura y anónima.
                  </Text>
                </View>
              </View>
            ) : (
              /* Caso Normal: Desglose del 100%, Tendencia y Comentarios */
              <>
                {/* Métricas clave: Tendencia Barrial y Participantes Aproximados */}
                <View style={estilos.filaMetricas}>
                  <View style={estilos.tarjetaMetrica}>
                    <View style={estilos.cabeceraMetrica}>
                      <TrendingUp size={16} color="#0284C7" strokeWidth={2.2} />
                      <Text style={estilos.etiquetaMetrica}>Tendencia</Text>
                    </View>
                    <Text style={estilos.valorMetrica} numberOfLines={2}>
                      {detalle?.tendencia || 'Estable'}
                    </Text>
                  </View>

                  <View style={estilos.tarjetaMetrica}>
                    <View style={estilos.cabeceraMetrica}>
                      <Users size={16} color="#10B981" strokeWidth={2.2} />
                      <Text style={estilos.etiquetaMetrica}>Participación</Text>
                    </View>
                    <Text style={estilos.valorMetrica}>
                      {detalle?.participantesAproximados || 'Participación activa'}
                    </Text>
                  </View>
                </View>

                {/* Sección de Desglose Emocional (Suma exacto 100%) */}
                <View style={estilos.seccionDesglose}>
                  <View style={estilos.cabeceraSeccion}>
                    <View style={estilos.tituloSeccionConIcono}>
                      <Sparkles size={16} color="#0F172A" strokeWidth={2.2} />
                      <Text style={estilos.tituloSeccion}>Distribución Emocional</Text>
                    </View>
                    <View style={estilos.badgeCienPorciento}>
                      <Text style={estilos.textoCienPorciento}>Suma: 100%</Text>
                    </View>
                  </View>

                  <Text style={estilos.subtituloSeccion}>
                    Proporción de emociones sentidas por los vecinos en {detalle?.periodoTemporal?.toLowerCase() || 'el período'}:
                  </Text>

                  {/* Barras de distribución porcentual */}
                  <View style={estilos.listaBarras}>
                    {emocionesConPorcentaje.map((item) => (
                      <View key={item.id} style={estilos.filaBarra}>
                        <View style={estilos.infoFilaBarra}>
                          <View style={estilos.etiquetaEmocion}>
                            <IconoEmocion
                              emocion={item.id}
                              color={item.colorPrincipal}
                              size={17}
                            />
                            <Text style={estilos.nombreEmocionBarra}>
                              {item.etiqueta}
                            </Text>
                          </View>
                          <Text
                            style={[
                              estilos.porcentajeTexto,
                              { color: item.porcentaje > 0 ? item.colorPrincipal : '#94A3B8' },
                            ]}
                          >
                            {item.porcentaje}%
                          </Text>
                        </View>

                        {/* Contenedor de la barra de progreso */}
                        <View style={estilos.pistaBarra}>
                          <View
                            style={[
                              estilos.rellenoBarra,
                              {
                                width: `${Math.max(item.porcentaje, 0)}%`,
                                backgroundColor: item.colorPrincipal,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Sección de Comentarios Moderados de la Comunidad (HU-03) */}
                <View style={estilos.seccionComentarios}>
                  <View style={estilos.cabeceraSeccion}>
                    <View style={estilos.tituloSeccionConIcono}>
                      <MessageSquare size={16} color="#0F172A" strokeWidth={2.2} />
                      <Text style={estilos.tituloSeccion}>Voces del Barrio</Text>
                    </View>
                    <Text style={estilos.etiquetaAnonimo}>Anónimos y moderados</Text>
                  </View>

                  {detalle?.comentariosRecientes && detalle.comentariosRecientes.length > 0 ? (
                    <View style={estilos.listaComentarios}>
                      {detalle.comentariosRecientes.map((comentario, index) => (
                        <View key={index} style={estilos.tarjetaComentario}>
                          <View style={estilos.puntoComentario} />
                          <Text style={estilos.textoComentario}>
                            "{comentario}"
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={estilos.cajaComentariosVacia}>
                      <Text style={estilos.textoComentariosVacio}>
                        No hay notas adicionales compartidas en este período.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Nota de Protección en Comunidad (Sin lenguaje técnico, enfocado al ciudadano) */}
                <View style={estilos.tarjetaProteccion}>
                  <View style={estilos.cabeceraProteccion}>
                    <Shield size={16} color="#15803D" strokeWidth={2.2} />
                    <Text style={estilos.tituloProteccion}>Protección en Comunidad</Text>
                  </View>
                  <Text style={estilos.cuerpoProteccion}>
                    {detalle?.descripcionProteccion ||
                      'Los datos se presentan siempre en rangos aproximados y agrupados para que ningún vecino pueda ser identificado.'}
                  </Text>
                  {detalle?.tiempoCalculoMs !== undefined && (
                    <View style={estilos.pieRendimiento}>
                      <Clock size={11} color="#64748B" strokeWidth={2} />
                      <Text style={estilos.textoRendimiento}>
                        Calculado en {detalle.tiempoCalculoMs} ms
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          {/* Botón inferior de acción */}
          <View style={estilos.pieModal}>
            <TouchableOpacity
              style={estilos.botonCerrarInferior}
              onPress={onCerrar}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotonCerrar}>Cerrar detalle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tarjetaPrincipal: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  circuloPredominante: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorNombre: {
    flex: 1,
  },
  tituloZona: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtituloEmocion: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contenedorFiltros: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  pildoraFiltro: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  pildoraFiltroActiva: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  textoPildora: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  textoPildoraActiva: {
    color: '#0284C7',
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 480,
  },
  scrollContenido: {
    paddingBottom: 16,
  },
  cajaCarga: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoCargando: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  cajaError: {
    padding: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  textoError: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  cajaReserva: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconoReservaGrande: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloReserva: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 6,
  },
  descripcionReserva: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  cajaNotaComunidad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  textoNotaComunidad: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  filaMetricas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tarjetaMetrica: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cabeceraMetrica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  etiquetaMetrica: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  valorMetrica: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  seccionDesglose: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tituloSeccionConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeCienPorciento: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoCienPorciento: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  subtituloSeccion: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  listaBarras: {
    gap: 12,
  },
  filaBarra: {
    gap: 4,
  },
  infoFilaBarra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiquetaEmocion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nombreEmocionBarra: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  porcentajeTexto: {
    fontSize: 13,
    fontWeight: '800',
  },
  pistaBarra: {
    height: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  rellenoBarra: {
    height: '100%',
    borderRadius: 5,
  },
  seccionComentarios: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  etiquetaAnonimo: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listaComentarios: {
    gap: 8,
    marginTop: 8,
  },
  tarjetaComentario: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  puntoComentario: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
    marginTop: 6,
  },
  textoComentario: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 18,
  },
  cajaComentariosVacia: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoComentariosVacio: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  tarjetaProteccion: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  cabeceraProteccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tituloProteccion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  cuerpoProteccion: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
  pieRendimiento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  textoRendimiento: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  pieModal: {
    paddingTop: 10,
  },
  botonCerrarInferior: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonCerrar: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
