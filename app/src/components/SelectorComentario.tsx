import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PropsSelectorComentario {
  comentarioInicial?: string;
  alConfirmarComentario: (comentario: string) => void;
  alOmitir?: () => void;
  estaEnviando?: boolean;
  deshabilitado?: boolean;
}

export const SelectorComentario: React.FC<PropsSelectorComentario> = ({
  comentarioInicial = '',
  alConfirmarComentario,
  alOmitir,
  estaEnviando = false,
  deshabilitado = false,
}) => {
  const [texto, setTexto] = useState<string>(comentarioInicial);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const LONGITUD_MAXIMA = 200;

  const manejarCambioTexto = (nuevoTexto: string) => {
    // Criterio 2 (HU-03): El campo de texto no debe permitir el ingreso de números o caracteres no válidos
    if (/\d/.test(nuevoTexto)) {
      setErrorValidacion('No se permiten números ni dígitos en el comentario (HU-03).');
      // Filtramos los dígitos numéricos inmediatamente para protección en tiempo real
      const textoSinNumeros = nuevoTexto.replace(/\d/g, '');
      setTexto(textoSinNumeros);
      return;
    }

    // Detectar si intenta ingresar tags HTML o scripts
    if (/[<>]/.test(nuevoTexto)) {
      setErrorValidacion('Por motivos de seguridad no se permiten caracteres < o >.');
      const textoSinTags = nuevoTexto.replace(/[<>]/g, '');
      setTexto(textoSinTags);
      return;
    }

    setErrorValidacion(null);
    setTexto(nuevoTexto);
  };

  const handleContinuar = () => {
    if (deshabilitado || estaEnviando) return;
    alConfirmarComentario(texto.trim());
  };

  const handleOmitir = () => {
    if (deshabilitado || estaEnviando) return;
    if (alOmitir) {
      alOmitir();
    } else {
      alConfirmarComentario('');
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Indicador de barra superior (mockup image4.png) */}
      <View style={estilos.barraIndicador} />

      {/* Título y subtítulo */}
      <Text style={estilos.titulo}>¿Quieres contarnos por qué?</Text>
      <Text style={estilos.subtitulo}>
        Es totalmente opcional. <Text style={estilos.iconoInfo}>ⓘ</Text>
      </Text>

      {/* Caja de texto para el comentario */}
      <View style={[estilos.cajaInput, errorValidacion ? estilos.cajaInputError : null]}>
        <TextInput
          style={estilos.inputTexto}
          placeholder="Ejemplo: Hay mucho ruido por las obras cercanas que me dificulta concentrarme..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          maxLength={LONGITUD_MAXIMA}
          value={texto}
          onChangeText={manejarCambioTexto}
          editable={!deshabilitado && !estaEnviando}
          textAlignVertical="top"
        />

        {/* Contador interactivo en la esquina inferior derecha (mockup image4.png) */}
        <View style={estilos.filaContador}>
          <Text style={estilos.textoContador}>
            ≡ {texto.length}/{LONGITUD_MAXIMA}
          </Text>
        </View>
      </View>

      {/* Mensaje de validación / error si se intentaron ingresar números */}
      {errorValidacion && (
        <View style={estilos.bannerError}>
          <Text style={estilos.textoError}>⚠️ {errorValidacion}</Text>
        </View>
      )}

      {/* Botones de acción: Continuar y Omitir */}
      <View style={estilos.filaBotones}>
        {texto.trim().length === 0 && (
          <TouchableOpacity
            style={estilos.botonOmitir}
            onPress={handleOmitir}
            disabled={deshabilitado || estaEnviando}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotonOmitir}>Omitir paso</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            estilos.botonContinuar,
            (deshabilitado || estaEnviando) && estilos.botonDeshabilitado,
          ]}
          onPress={handleContinuar}
          disabled={deshabilitado || estaEnviando}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotonContinuar}>
            {estaEnviando ? 'Guardando...' : 'Continuar ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  barraIndicador: {
    width: 60,
    height: 4,
    backgroundColor: '#111827',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  iconoInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  cajaInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cajaInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputTexto: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    minHeight: 90,
  },
  filaContador: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  textoContador: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bannerError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  textoError: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  botonOmitir: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonOmitir: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  botonContinuar: {
    flex: 2,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonContinuar: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
