# Almara — Portal Web (`almara-frontend/web`)

Aplicación web para **Administradores** y **Clientes Institucionales**, desarrollada con **React**, **TypeScript** y **Vite**.

## Perfiles Soportados
1. **Administrador (`ROLE_ADMIN`)**:
   - Inicio de sesión seguro con control de intentos fallidos y bloqueo (HU-11).
   - Gestión del catálogo de emociones predeterminadas (HU-12).
   - Ajuste de umbrales mínimos de participación / $k$-anonimato (HU-13).
   - Ajuste y delimitación de zonas geográficas y resolución H3 (HU-14).
   - Aprobación, activación y suspensión de clientes institucionales con motivo de auditoría (HU-15).
   - Cierre de sesión seguro (HU-18).

2. **Cliente Institucional (`ROLE_INSTITUTIONAL`)**:
   - Registro corporativo con NIT y correo corporativo (HU-16).
   - Inicio de sesión y verificación (HU-17).
   - Dashboard institucional con métricas agregadas y tendencias históricas (HU-09, HU-10).
   - Comparación multidimensional de zonas urbanas y alertas configurables (HU-21, HU-22).
   - Cierre de sesión seguro (HU-18).

## Estructura de Directorios

```
web/
└── src/
    ├── components/    (Tarjetas de métricas, gráficos de evolución, tablas de auditoría, mapas)
    ├── pages/         (Login, DashboardInstitucional, AdminCatalogo, AdminUmbrales, AdminUsuarios)
    ├── routes/        (Enrutamiento protegido por token JWT y roles de usuario)
    ├── services/      (Consumo de endpoints `/api/auth`, `/api/admin`, `/api/institutional`)
    ├── hooks/         (Hooks reutilizables para autenticación, WebSocket y métricas)
    └── context/       (Contexto de sesión y autenticación de usuario)
```
