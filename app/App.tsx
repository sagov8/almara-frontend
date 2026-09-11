import React from 'react';
import { registerRootComponent } from 'expo';
const { PantallaSeleccionEmocion } = require('./src/screens/PantallaSeleccionEmocion');

/**
 * Componente principal de la aplicación móvil Almara.
 * Despliega la pantalla de selección de emoción (HU-01).
 */
export default function App() {
  return React.createElement(PantallaSeleccionEmocion);
}

// Registra el componente raíz con AppRegistry de React Native ('main') para Expo
registerRootComponent(App);
