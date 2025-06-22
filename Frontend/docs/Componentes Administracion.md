# Documentación de Componentes de Administración - Turify Frontend

**Última actualización:** 22/06/2025

---

## Visión General

El panel de administración de Turify está construido utilizando Astro como framework principal, con componentes modulares que facilitan la reutilización y el mantenimiento. Este documento describe los componentes principales que forman parte del panel de administración.

## Componentes Principales

### AdminMenu.js

Este componente define la estructura de navegación del panel de administrador:

```javascript
export const AdminMenu = [
  { label: "Gestión", href: "/admin/gestion" },
  { label: "Categorías", href: "/admin/categorias" },
  { label: "Rutas", href: "/admin/rutas" },
  { label: "Usuarios", href: "/admin/usuarios" },
];
```

- **Propósito**: Centralizar las opciones de navegación del panel administrativo.
- **Ventajas**: 
  - Facilita añadir o modificar secciones del menú desde un único archivo.
  - Mantiene la consistencia en todas las páginas del panel.

### AdminPanel.astro

Este componente funciona como layout principal para todas las páginas de administración:

- **Estructura**:
  - **Sidebar**: Barra lateral con menú de navegación y logo para volver al sitio principal.
  - **Main Content**: Área principal donde se renderiza el contenido específico de cada página.
  - **Menú Responsive**: Botón de hamburguesa para mostrar/ocultar el menú en dispositivos móviles.

- **Props**:
  - `menu`: Array de objetos con estructura `{ label, href }` para las opciones de navegación.
  - `children`: Contenido a renderizar en el área principal.

- **Funcionalidades**:
  - Gestión de la navegación entre secciones administrativas.
  - Adaptación responsive para diferentes tamaños de pantalla.
  - Toggle del menú lateral en dispositivos móviles.

### TableAdmin.astro

Componente reutilizable para mostrar tablas de datos administrativos:

- **Props**:
  - `titulo`: Título de la sección de tabla.
  - `btnNuevoLabel`: Etiqueta para el botón de creación (por defecto: "+ Nuevo").
  - `btnNuevoHref`: URL para la página de creación de nuevos elementos.
  - `columnas`: Array de objetos que definen las columnas (`{ key, label }`).
  - `datos`: Array de objetos con los datos a mostrar.
  - `tipoEntidad`, `entidadSingular`, `entidadPlural`: Texto para personalizar mensajes.

- **Funcionalidades**:
  - Renderizado de datos en formato tabular.
  - Botones de acción (Editar, Eliminar) para cada fila.
  - Mensajes personalizados cuando no hay datos.
  - Modal de confirmación para operaciones destructivas.
  - Paginación y filtrado de resultados.

## Páginas Administrativas

Las páginas administrativas utilizan estos componentes para crear una experiencia coherente:

1. **gestion.astro**: Gestión de atractivos turísticos.
2. **categorias.astro**: Administración de categorías de atractivos.
3. **rutas.astro**: Gestión de rutas turísticas.
4. **usuarios.astro**: Administración de usuarios.

Cada una de estas páginas sigue un patrón similar:
- Importan el componente `AdminPanel.astro` como layout base.
- Utilizan `TableAdmin.astro` para mostrar los datos.
- Implementan lógica específica para su entidad correspondiente.

## Estilos

Los estilos para el panel de administración están modularizados:

- **paneladmin.css**: Estilos para el layout general del panel.
- **global.css**: Variables y estilos comunes a toda la aplicación.
- Hojas de estilo específicas para cada tipo de entidad.

## Interacciones JavaScript

El archivo `paneladmin.js` maneja las interacciones del usuario:
- Toggle del menú lateral en dispositivos móviles.
- Confirmaciones para operaciones destructivas.
- Interacciones con modales.

## Buenas Prácticas Implementadas

- **Componentes modulares**: Cada componente tiene una responsabilidad única.
- **Reutilización**: Componentes como TableAdmin reducen la duplicación de código.
- **Separación de preocupaciones**: Estructura, estilos y comportamiento están separados.
- **Diseño responsive**: Adaptación para diferentes tamaños de pantalla.
