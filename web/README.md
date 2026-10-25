# Almara — Portal Web (`almara-frontend/web`)

Aplicación web para **Administradores** y **Clientes Institucionales**, desarrollada con **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons** y **Vite**.

---

## Módulos Soportados

### 1. Panel de Administración
- Acceso seguro para el equipo de administración (`admin@almara.com`).
- Gestión completa del catálogo de emociones (creación, edición y activación de emociones con íconos vectoriales Lucide).
- Configuración de los umbrales de privacidad comunitaria (k-anonimato).
- Gestión y delimitación de sectores territoriales urbanos.
- Administración del ciclo de vida de usuarios y entidades institucionales.

![Panel de Administración](../docs/screenshots/panel-admin.png)

### 2. Portal de Cliente Institucional (Almara SaaS)
- Registro corporativo con correo institucional y verificación en dos pasos.
- Panel analítico con menú lateral:
  - **Indicadores Clave:** Métricas de clima emocional de Popayán y distribución porcentual.
  - **Filtrado y Análisis por Zonas:** Consulta focalizada por barrios y sectores de la ciudad.
  - **Exportación:** Descarga de reportes oficiales.
- Catálogo de planes, pasarela de suscripción y comprobantes de pago.

![Panel de Cliente Institucional](../docs/screenshots/panel-institucional.png)

---

## Ejecución Local

```bash
# Instalar dependencias con pnpm
pnpm install

# Iniciar servidor de desarrollo en http://localhost:5173
pnpm dev
```
