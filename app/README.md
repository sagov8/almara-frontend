# Almara — App Móvil y Ciudadana (`almara-frontend/app`)

Aplicación orientada a **ciudadanos anónimos**, desarrollada con **React Native** y el ecosistema **Expo**.

Permite registrar el estado emocional actual en segundos, indicar el nivel de intensidad, agregar un comentario contextual opcional y explorar el mapa colectivo de la ciudad de Popayán en vivo.

![Aplicación Ciudadana](../docs/screenshots/app-ciudadana.png)

---

## Características Principales

- **Privacidad Total desde el Diseño**: No requiere registro ni inicio de sesión para los ciudadanos. El envío de información es completamente anónimo y protegido.
- **Iconografía Profesional Vectorial**: Utiliza la librería **Lucide Icons** (`lucide-react-native`), sincronizada dinámicamente con el catálogo configurado en el backend.
- **Sincronización en Tiempo Real**: Visualización interactiva del mapa urbano mediante WebSocket, actualizando el clima barrial al instante.
- **Protección Comunitaria**: Solo se muestran datos agregados de zonas donde múltiples vecinos han participado, cuidando la reserva de las personas.

---

## Ejecución Local

```bash
# Instalar dependencias con pnpm
pnpm install

# Iniciar servidor de Expo
pnpm start
```

- Para probar en navegador web, presione **`w`** en la consola o ejecute `pnpm web` (`http://localhost:8081`).
- Para probar en dispositivo físico, escanee el código QR desde la aplicación **Expo Go**.
