# Almara — Frontend (`almara-frontend`)

Repositorio unificado para las interfaces de usuario del sistema Almara ("Urban Emotional Intelligence").

Está dividido en dos proyectos independientes según el perfil de usuario y la plataforma de despliegue:

```
almara-frontend/
├── app/    # Aplicación móvil para Ciudadanos (React Native con Expo)
└── web/    # Portal Institucional y Panel de Administración (React Web SPA)
```

## Estructura

### 1. `app/` (Móvil - Ciudadanos anónimos)
- **Tecnología:** React Native con Expo.
- **Alcance:** Historias de usuario HU-01 a HU-07.
- **Funcionalidades:**
  - Registro anónimo de emociones en máximo 2 toques (Felicidad, Neutralidad, Preocupación, Enfado, Ansiedad).
  - Selector de intensidad (1-5) y comentario opcional.
  - Autorización de ubicación / selección manual de zona convertida a celda hexagonal H3.
  - Mapa interactivo de la ciudad en vivo con celdas H3 coloreadas según emoción dominante.
  - Sincronización en tiempo real vía WebSocket / STOMP.
  - Detalle analítico por celda que supere el umbral de $k$-anonimato ($k \ge 5$).

### 2. `web/` (Web - Institucional y Administración)
- **Tecnología:** React + TypeScript + Vite.
- **Alcance:** Historias de usuario HU-09 a HU-18, HU-19 a HU-22.
- **Funcionalidades:**
  - Autenticación con JWT (`ROLE_ADMIN` y `ROLE_INSTITUTIONAL`).
  - Panel administrativo: gestión del catálogo de emociones, ajuste de umbrales $k$, resolución H3 y auditoría de eventos.
  - Portal institucional ("Almara Control"): mapa corporativo, análisis histórico, comparación de zonas y monitoreo de alertas CEP.
