# Almara — App Móvil (`almara-frontend/app`)

Aplicación móvil orientada a **ciudadanos anónimos**, desarrollada con **React Native** y el ecosistema **Expo**.

## Principios de Diseño y Arquitectura
- **Privacy by Design**: No existe login para ciudadanos; se genera un identificador temporal efímero en memoria solo para unicidad de sesión. Las coordenadas nunca se envían crudas al backend; se transforman internamente a celda H3.
- **Usabilidad (RNF-20)**: Registro de emoción en máximo dos toques (HU-01).
- **Accesibilidad (RNF-21)**: Iconos, etiquetas descriptivas y porcentajes además de colores para personas con daltonismo.
- **Tiempo Real (RNF-01 / HU-07)**: Conexión WebSocket STOMP con reconexión automática y backoff exponencial.

## Estructura de Directorios

```
app/
├── assets/            (Íconos, fuentes, logo de Almara)
└── src/
    ├── components/    (Tarjetas de emoción, sliders, hexágonos H3, insignias de estado)
    ├── screens/       (Pantallas: RegistroEmocion, Intensidad, Comentario, MapaEnVivo, DetalleZona)
    ├── navigation/    (Pestañas: Inicio, Registrar, Explorar, Privacidad)
    ├── services/      (Cliente API REST, cliente WebSocket/STOMP, utilidades GPS y celda H3)
    ├── context/       (Estado global de conexión y preferencias anónimas)
    └── constants/     (Colores de emociones, etiquetas, resolución H3)
```
