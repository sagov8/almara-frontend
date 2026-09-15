import React, { useState } from 'react';
import { registerRootComponent } from 'expo';
import { PantallaSeleccionEmocion } from './src/screens/PantallaSeleccionEmocion';
import { PantallaMapaExplorar } from './src/screens/PantallaMapaExplorar';
import { PantallaPrivacidad } from './src/screens/PantallaPrivacidad';
import { PestañaNavegacion } from './src/components/BarraNavegacionInferior';

/**
 * Componente raíz de la aplicación móvil Almara.
 * Integra las historias de usuario HU-01 a HU-05 con navegación fluida entre pestañas:
 * - [Inicio / Explorar]: Mapa interactivo colectivo de Popayán (HU-05)
 * - [Registrar]: Flujo completo de emoción, intensidad, ubicación y comentario (HU-01 a HU-04)
 * - [Privacidad]: Explicación amigable de Protección en Comunidad
 */
export default function App() {
  const [pestañaActiva, setPestañaActiva] = useState<PestañaNavegacion>('explorar');

  switch (pestañaActiva) {
    case 'registrar':
      return <PantallaSeleccionEmocion alNavegar={setPestañaActiva} />;
    case 'privacidad':
      return <PantallaPrivacidad alNavegar={setPestañaActiva} />;
    case 'explorar':
    case 'inicio':
    default:
      return <PantallaMapaExplorar alNavegar={setPestañaActiva} />;
  }
}

// Registra el componente raíz con AppRegistry de React Native ('main') para Expo
registerRootComponent(App);
