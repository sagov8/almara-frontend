import { CeldaMapaEmocional } from './servicioMapa';
import { obtenerUrlBase } from './servicioEmocion';

export type EstadoConexionWebSocket = 'CONECTADO' | 'CONECTANDO' | 'RECONECTANDO' | 'DESCONECTADO';

export type ObservadorActualizacionCelda = (celda: CeldaMapaEmocional) => void;
export type ObservadorEstadoConexion = (estado: EstadoConexionWebSocket) => void;

interface MensajeEntranteWebSocket {
  tipo: string;
  canal?: string;
  celda?: CeldaMapaEmocional;
  mensaje?: string;
  timestamp?: number;
}

class ClienteWebSocketMapa {
  private socket: WebSocket | null = null;
  private canalSuscripcion: string = '/topic/mapa/popayan';
  private estadoActual: EstadoConexionWebSocket = 'DESCONECTADO';

  private observadoresActualizacion: Set<ObservadorActualizacionCelda> = new Set();
  private observadoresEstado: Set<ObservadorEstadoConexion> = new Set();

  // Parámetros de retroceso exponencial (RNF Fiabilidad / Disponibilidad)
  private intentoReconexion: number = 0;
  private temporizadorReconexion: any = null;
  private temporizadorLatido: any = null;
  private desconexionVoluntaria: boolean = false;

  private readonly DELAY_BASE_MS = 1000;
  private readonly MULTIPLICADOR = 1.5;
  private readonly MAX_DELAY_MS = 15000;
  private readonly INTERVALO_LATIDO_MS = 25000;

  /**
   * Resuelve la URL ws:// o wss:// a partir de la URL base HTTP del backend.
   */
  private resolverUrlWebSocket(canal: string): string {
    const urlHttp = obtenerUrlBase();
    // Reemplazar http -> ws y https -> wss
    let urlWs = urlHttp.replace(/^http/, 'ws');
    // Remover sufijo /api/v1 para llegar a la raíz del host y mapear /ws/mapa
    urlWs = urlWs.replace(/\/api\/v1\/?$/, '');
    return `${urlWs}/ws/mapa?canal=${encodeURIComponent(canal)}`;
  }

  /**
   * Inicia la conexión WebSocket en tiempo real hacia el canal indicado (HU-07 CA-1).
   */
  public conectar(canal: string = '/topic/mapa/popayan') {
    this.canalSuscripcion = canal;
    this.desconexionVoluntaria = false;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.cambiarEstado(this.intentoReconexion === 0 ? 'CONECTANDO' : 'RECONECTANDO');

    const urlWs = this.resolverUrlWebSocket(this.canalSuscripcion);
    console.log(`[WebSocket Mapa] Conectando a ${urlWs}...`);

    try {
      this.socket = new WebSocket(urlWs);

      this.socket.onopen = () => {
        console.log(`[WebSocket Mapa] Conexión establecida con éxito en canal: ${this.canalSuscripcion}`);
        this.intentoReconexion = 0;
        this.cambiarEstado('CONECTADO');
        this.iniciarLatidos();

        // Enviar suscripción explícita al canal
        this.enviarMensaje({
          tipo: 'SUSCRIBIR',
          canal: this.canalSuscripcion,
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const data: MensajeEntranteWebSocket = JSON.parse(event.data);
          if (data.tipo === 'ACTUALIZACION_CELDA' && data.celda) {
            console.log(`[WebSocket Mapa] Actualización de celda recibida: ${data.celda.idCeldaH3} (${data.celda.nombreEmocion})`);
            this.notificarActualizacion(data.celda);
          }
        } catch (err) {
          console.warn('[WebSocket Mapa] Error parseando mensaje entrante:', err);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`[WebSocket Mapa] Conexión cerrada (Código: ${event.code}, Razón: ${event.reason})`);
        this.detenerLatidos();
        if (!this.desconexionVoluntaria) {
          this.programarReconexion();
        } else {
          this.cambiarEstado('DESCONECTADO');
        }
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket Mapa] Error en conexión de socket:', error);
        // onclose se ejecutará automáticamente tras onerror
      };
    } catch (error) {
      console.warn('[WebSocket Mapa] Excepción al instanciar WebSocket:', error);
      this.programarReconexion();
    }
  }

  /**
   * Programa reconexión automática mediante retroceso exponencial (RNF Fiabilidad).
   */
  private programarReconexion() {
    if (this.desconexionVoluntaria) return;

    this.cambiarEstado('RECONECTANDO');
    if (this.temporizadorReconexion) {
      clearTimeout(this.temporizadorReconexion);
    }

    // Cálculo de tiempo: min(delayBase * multiplicador^intento, maxDelay)
    const delay = Math.min(
      this.DELAY_BASE_MS * Math.pow(this.MULTIPLICADOR, this.intentoReconexion),
      this.MAX_DELAY_MS
    );
    this.intentoReconexion++;

    console.log(`[WebSocket Mapa] Reintentando conexión en ${Math.round(delay)} ms (Intento #${this.intentoReconexion})...`);

    this.temporizadorReconexion = setTimeout(() => {
      this.conectar(this.canalSuscripcion);
    }, delay);
  }

  /**
   * Desconecta intencionalmente el socket y detiene reintentos.
   */
  public desconectar() {
    this.desconexionVoluntaria = true;
    this.detenerLatidos();
    if (this.temporizadorReconexion) {
      clearTimeout(this.temporizadorReconexion);
      this.temporizadorReconexion = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.cambiarEstado('DESCONECTADO');
  }

  /**
   * Patrón Observer: Suscribe un observador para recibir actualizaciones en vivo de celdas.
   */
  public suscribirActualizaciones(observador: ObservadorActualizacionCelda): () => void {
    this.observadoresActualizacion.add(observador);
    return () => {
      this.observadoresActualizacion.delete(observador);
    };
  }

  /**
   * Patrón Observer: Suscribe un observador para cambios en el estado de conexión.
   */
  public suscribirEstado(observador: ObservadorEstadoConexion): () => void {
    this.observadoresEstado.add(observador);
    observador(this.estadoActual);
    return () => {
      this.observadoresEstado.delete(observador);
    };
  }

  public getEstadoActual(): EstadoConexionWebSocket {
    return this.estadoActual;
  }

  private cambiarEstado(nuevoEstado: EstadoConexionWebSocket) {
    if (this.estadoActual !== nuevoEstado) {
      this.estadoActual = nuevoEstado;
      this.observadoresEstado.forEach((obs) => {
        try {
          obs(nuevoEstado);
        } catch (e) {
          console.warn('[WebSocket Mapa] Error en observador de estado:', e);
        }
      });
    }
  }

  private notificarActualizacion(celda: CeldaMapaEmocional) {
    this.observadoresActualizacion.forEach((obs) => {
      try {
        obs(celda);
      } catch (e) {
        console.warn('[WebSocket Mapa] Error en observador de celda:', e);
      }
    });
  }

  private enviarMensaje(mensaje: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(mensaje));
      } catch (e) {
        console.warn('[WebSocket Mapa] Error enviando mensaje:', e);
      }
    }
  }

  private iniciarLatidos() {
    this.detenerLatidos();
    this.temporizadorLatido = setInterval(() => {
      this.enviarMensaje({ tipo: 'LATIDO' });
    }, this.INTERVALO_LATIDO_MS);
  }

  private detenerLatidos() {
    if (this.temporizadorLatido) {
      clearInterval(this.temporizadorLatido);
      this.temporizadorLatido = null;
    }
  }
}

// Instancia única (Singleton) compartida en el frontend
export const servicioWebSocketMapa = new ClienteWebSocketMapa();
