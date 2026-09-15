import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Shield, Users, Lock, MapPin, Heart } from 'lucide-react-native';
import { BarraNavegacionInferior, PestañaNavegacion } from '../components/BarraNavegacionInferior';

interface PropiedadesPantallaPrivacidad {
  alNavegar?: (pestaña: PestañaNavegacion) => void;
}

/**
 * Pantalla informativa de Privacidad Ciudadana y Protección en Comunidad (HU-05).
 * Redactada con Lucide Icons y lenguaje cercano y accesible para ciudadanos comunes.
 */
export const PantallaPrivacidad: React.FC<PropiedadesPantallaPrivacidad> = ({ alNavegar }) => {
  return (
    <SafeAreaView style={estilos.contenedorSeguro}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={estilos.cabecera}>
        <View style={estilos.filaCabecera}>
          <Shield size={22} color="#0284C7" strokeWidth={2.4} />
          <Text style={estilos.tituloCabecera}>Privacidad Ciudadana</Text>
        </View>
      </View>

      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContenido}>
        <View style={estilos.tarjetaPrincipal}>
          <View style={estilos.circuloIconoPrincipal}>
            <Users size={32} color="#0284C7" strokeWidth={2.2} />
          </View>
          <Text style={estilos.tituloPrincipal}>Protección en Comunidad</Text>
          <Text style={estilos.parrafoPrincipal}>
            En Almara creemos que el bienestar de la ciudad se construye juntos, pero tu tranquilidad individual es lo primero.
          </Text>
        </View>

        <View style={estilos.tarjetaExplicacion}>
          <Text style={estilos.subtitulo}>¿Por qué las zonas se colorean con al menos 5 personas?</Text>
          <Text style={estilos.parrafo}>
            Para que nadie pueda adivinar cómo te sientes tú en particular, el mapa únicamente muestra el color emocional de un sector cuando al menos 5 vecinos han compartido su estado de ánimo en ese lugar.
          </Text>
          <Text style={estilos.parrafo}>
            Si en un sector todavía hay menos de 5 opiniones, la zona se mantiene en reserva y neutral. Así tu aporte individual queda protegido dentro del sentir colectivo.
          </Text>
        </View>

        <View style={estilos.tarjetaExplicacion}>
          <Text style={estilos.subtitulo}>¿Qué pasa con mi ubicación?</Text>
          <Text style={estilos.parrafo}>
            • Cuando compartes tu emoción, tu GPS solo se usa por un segundo para saber en qué barrio o sector general estás.
          </Text>
          <Text style={estilos.parrafo}>
            • Tus coordenadas exactas (como tu casa o la esquina donde estás parado) jamás se guardan ni se envían a ningún lado.
          </Text>
          <Text style={estilos.parrafo}>
            • Tampoco te pedimos nombre, correo ni número de teléfono. Todo es 100% anónimo.
          </Text>
        </View>

        <View style={estilos.tarjetaResumen}>
          <Text style={estilos.tituloResumen}>En resumen:</Text>
          <View style={estilos.filaResumen}>
            <Lock size={15} color="#15803D" strokeWidth={2.2} />
            <Text style={estilos.itemResumen}>Cero datos personales almacenados.</Text>
          </View>
          <View style={estilos.filaResumen}>
            <MapPin size={15} color="#15803D" strokeWidth={2.2} />
            <Text style={estilos.itemResumen}>Tu ubicación exacta se descarta al instante.</Text>
          </View>
          <View style={estilos.filaResumen}>
            <Users size={15} color="#15803D" strokeWidth={2.2} />
            <Text style={estilos.itemResumen}>Mínimo 5 vecinos para mostrar un área.</Text>
          </View>
          <View style={estilos.filaResumen}>
            <Heart size={15} color="#15803D" strokeWidth={2.2} />
            <Text style={estilos.itemResumen}>Tu sentir ayuda a cuidar a Popayán.</Text>
          </View>
        </View>
      </ScrollView>

      <BarraNavegacionInferior
        pestañaActiva="privacidad"
        alCambiarPestaña={(p) => alNavegar && alNavegar(p)}
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  cabecera: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  scrollContenido: {
    padding: 20,
    gap: 16,
  },
  tarjetaPrincipal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  circuloIconoPrincipal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloPrincipal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  parrafoPrincipal: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  tarjetaExplicacion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  subtitulo: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  parrafo: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  tarjetaResumen: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 8,
  },
  tituloResumen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  filaResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemResumen: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
  },
});
