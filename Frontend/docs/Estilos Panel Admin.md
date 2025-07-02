# Documentación de Estilos del Panel Administrativo - Turify Frontend

**Última actualización:** 22/06/2025

---

## Visión General

Este documento describe los archivos CSS que definen los estilos del panel administrativo de Turify, su organización y funcionalidades principales. La estructura de estilos está diseñada para ser modular, reutilizable y fácil de mantener.

## Archivos Principales

### global.css

- **Ubicación**: `src/style/global.css`
- **Propósito**: Define variables CSS globales y estilos base compartidos por toda la aplicación.

- **Contenido**:
  - Variables de colores primarios y secundarios
  - Variables de tipografía (fuentes, tamaños)
  - Variables de espaciado y breakpoints
  - Estilos de reset y normalización
  - Estilos base para elementos HTML comunes

### paneladmin.css

- **Ubicación**: `src/style/paneladmin.css`
- **Propósito**: Estilos específicos para el layout del panel de administración.

- **Contenido**:
  - Estructura del grid para el layout admin
  - Estilos de la barra lateral (sidebar)
  - Estilos del menú de navegación
  - Animaciones para el toggle del menú
  - Estilos responsive para distintos tamaños de pantalla
  - Tema visual (colores, sombras) del panel admin

### form-atractivo.css

- **Ubicación**: `src/style/form-atractivo.css`
- **Propósito**: Estilos específicos para el formulario de creación/edición de atractivos.

- **Contenido**:
  - Layout de formularios multi-sección
  - Estilos para carga de imágenes
  - Estilos para el selector de mapa
  - Estilos para campos de formulario específicos
  - Validación visual de campos

### form-editar.css

- **Ubicación**: `src/style/form-editar.css`
- **Propósito**: Estilos compartidos para todos los formularios de edición.

- **Contenido**:
  - Estilos base para formularios
  - Estilos de inputs, selects, checkboxes
  - Estilos de botones de acción
  - Mensajes de feedback (éxito, error, advertencia)
  - Animaciones para transiciones de estado

### categorias.css

- **Ubicación**: `src/style/categorias.css`
- **Propósito**: Estilos específicos para la gestión de categorías.

- **Contenido**:
  - Estilos para la visualización de miniaturas de categorías
  - Grid para listado de categorías
  - Estilos para badges y etiquetas de categorías
  - Estilos específicos para el selector de categorías

### modal.css

- **Ubicación**: `src/style/modal.css`
- **Propósito**: Estilos para ventanas modales utilizadas en todo el panel.

- **Contenido**:
  - Estructura base para modales
  - Animaciones de entrada/salida
  - Variantes de modales (información, confirmación, formulario)
  - Overlay y manejo de z-index
  - Estilos responsive para modales

## Organización y Metodología

- **Importaciones**: Cada archivo CSS específico importa global.css para acceder a las variables comunes.
- **Selectores**: Se sigue una metodología similar a BEM para evitar conflictos de especificidad.
- **Media Queries**: Enfoque mobile-first con breakpoints definidos en global.css.
- **Variables CSS**: Uso extensivo de variables CSS para mantener consistencia y facilitar cambios.

## Ejemplo de Estructura de Selector

```css
.admin-table {
  /* Estilos para la tabla */
}

.admin-table__header {
  /* Estilos para el encabezado de la tabla */
}

.admin-table__cell {
  /* Estilos para las celdas */
}

.admin-table__cell--highlight {
  /* Variante para celdas destacadas */
}
```

## Consideraciones de Rendimiento

- Minimización de anidamiento de selectores.
- Uso de propiedades que favorecen el rendimiento (transform, opacity vs. height, display).
- Reutilización de clases para reducir el tamaño total del CSS.
- Prefijado automático para mayor compatibilidad con navegadores.

## Responsividad

El diseño es completamente responsive, con tres breakpoints principales:
- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Características responsivas clave:
- Sidebar colapsable en dispositivos móviles
- Cambios de layout de tablas para mejor visualización en pantallas pequeñas
- Ajustes de tamaño de texto y espaciado
- Optimización de formularios para entrada táctil en dispositivos móviles

## Temas y Personalización

El sistema está preparado para soportar múltiples temas mediante:
- Variables CSS para colores y estilos principales
- Clase raíz para activar temas alternativos (ej. modo oscuro)
- Transiciones suaves entre estados de tema
