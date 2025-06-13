# Documentación de menú administrador - Turify

**Responsable:** Santiago Suarez  
**Última actualización:** 13/06/2025

---

## Estructura y aportes principales

### 1. Componentes de administración (`src/components/`)

- **AdminMenu.js**  
  Centraliza las rutas y etiquetas del menú de administración, facilitando la navegación y el mantenimiento del panel admin.

- **AdminPanel.astro**  
  Layout principal del panel de administración. Renderiza la barra lateral con el menú y aplica los estilos y scripts necesarios para la experiencia de usuario en el panel.

### 2. Páginas de administración (`src/pages/admin/`)

- **atractivos.astro**  
  Página que muestra el listado de atractivos turísticos y permite acceder a la creación de nuevos atractivos.

- **atractivos-nuevo.astro**  
  Página con el formulario para agregar un nuevo atractivo turístico. Incluye mensajes de confirmación tras la creación.

### 3. Estilos (`src/style/`)

- **global.css**  
  Contiene variables CSS y estilos base compartidos por todo el frontend (colores, fuentes, etc.).

- **atractivos.css**  
  Estilos específicos para la tabla/listado de atractivos turísticos.

- **atractivos-nuevo.css**  
  Estilos para el formulario de alta de atractivos turísticos.

- **paneladmin.css**  
  Estilos para el layout y la barra lateral del panel de administración.

### 4. Scripts (`src/scripts/`)

- **paneladmin.js**  
  Script que maneja la interacción del menú lateral (sidebar) en el panel de administración, incluyendo la animación y el comportamiento responsive.

---

## Notas

- Todos los estilos específicos importan `global.css` para compartir variables y estilos base.
- La estructura modular facilita el mantenimiento y la escalabilidad del proyecto.
- Para detalles técnicos de cada componente, revisar directamente el código fuente correspondiente.

---