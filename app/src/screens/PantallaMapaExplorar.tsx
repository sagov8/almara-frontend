import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Search, Bell, User } from 'lucide-react-native';
import { MapaInteractivoEmociones } from '../components/MapaInteractivoEmociones';
import { BarraNavegacionInferior, PestañaNavegacion } from '../components/BarraNavegacionInferior';
import { CeldaMapaEmocional } from '../services/servicioMapa';

interface PropiedadesPantallaExplorar {
  alNavegar?: (pestaña: PestañaNavegacion) => void;
}

/**
 * Pantalla de Exploración del Mapa Interactivo Colectivo (HU-05).
 * Con Lucide Icons en la cabecera e integración con OpenStreetMap de Popayán.
 */
export const PantallaMapaExplorar: React.FC<PropiedadesPantallaExplorar> = ({ alNavegar }) => {
  const [zonaActiva, setZonaActiva] = useState<CeldaMapaEmocional | null>(null);

  const manejarCambioPestaña = (pestaña: PestañaNavegacion) => {
    if (alNavegar) {
      alNavegar(pestaña);
    }
  };

  return (
    <SafeAreaView style={estilos.contenedorSeguro}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Cabecera superior según Mockup image6.png con Lucide Icons */}
      <View style={estilos.cabecera}>
        <Text style={estilos.logoTexto}>Almara</Text>

        <View style={estilos.accionesDerecha}>
          <TouchableOpacity style={estilos.botonAccion} activeOpacity={0.7}>
            <Search size={20} color="#334155" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botonAccion} activeOpacity={0.7}>
            <View style={estilos.contenedorCampana}>
              <Bell size={20} color="#334155" strokeWidth={2} />
              <View style={estilos.puntoNotificacion} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botonAccion} activeOpacity={0.7}>
            <User size={20} color="#334155" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa interactivo hexagonal con OpenStreetMap de Popayán y zoom dinámico */}
      <View style={estilos.areaMapa}>
        <MapaInteractivoEmociones
          onSeleccionarZona={(celda) => setZonaActiva(celda)}
        />
      </View>

      {/* Barra de navegación inferior simétrica */}
      <BarraNavegacionInferior
        pestañaActiva="explorar"
        alCambiarPestaña={manejarCambioPestaña}
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoTexto: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  accionesDerecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  botonAccion: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorCampana: {
    position: 'relative',
  },
  puntoNotificacion: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  areaMapa: {
    flex: 1,
  },
});
