# Documentación de Gestión de Atractivos - Frontend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de gestión de atractivos turísticos permite a los administradores crear, editar, visualizar y eliminar los puntos de interés turístico en la plataforma Turify. Este documento describe la implementación de las páginas y componentes relacionados con la gestión de atractivos.

## Páginas Principales

### gestion.astro

- **Ubicación**: `src/pages/admin/gestion.astro`
- **Propósito**: Mostrar un listado de todos los atractivos turísticos registrados en el sistema.

- **Funcionalidades**:
  - Listado tabular de atractivos con información principal.
  - Filtrado por nombre, categoría y empresa.
  - Botones para crear, editar y eliminar atractivos.
  - Integración con el panel de administración.
  - Consumo de la API para obtener datos actualizados.

### gestion-nuevo.astro

- **Ubicación**: `src/pages/admin/gestion-nuevo.astro`
- **Propósito**: Proporcionar un formulario para la creación de nuevos atractivos turísticos.

- **Funcionalidades**:
  - Formulario con validación para todos los campos requeridos.
  - Selección de empresa relacionada y categoría.
  - Selección de ubicación mediante mapa interactivo.
  - Carga de imágenes para el atractivo.
  - Mensajes de éxito/error tras la creación.
  - Integración con el panel de administración.

### gestion-editar.astro

- **Ubicación**: `src/pages/admin/gestion-editar.astro`
- **Propósito**: Formulario para editar atractivos existentes.

- **Funcionalidades**:
  - Carga de datos existentes del atractivo seleccionado.
  - Formulario con validación para actualización de datos.
  - Gestión de imágenes (añadir, eliminar, establecer como principal).
  - Editor para descripción con formato enriquecido.
  - Mensajes de confirmación tras actualización.

## Componentes Utilizados

- **AdminPanel.astro**: Layout principal del panel administrativo.
- **TableAdmin.astro**: Componente para mostrar los datos tabulares de atractivos.

## Estilos

Los estilos para la sección de atractivos se encuentran en:
- **global.css**: Variables y estilos globales
- **paneladmin.css**: Estilos generales del panel de administración
- **form-atractivo.css**: Estilos específicos para el formulario de atractivos
- **form-editar.css**: Estilos compartidos para formularios de edición
- **modal.css**: Estilos para modales (previsualizaciones, confirmaciones)

## Interacción con la API

Las páginas de atractivos interactúan con estos endpoints de la API:

- `GET /api/atractivos`: Obtener todos los atractivos con opciones de filtrado
- `GET /api/atractivos/:id`: Obtener detalles de un atractivo específico
- `POST /api/atractivos`: Crear un nuevo atractivo
- `PUT /api/atractivos/:id`: Actualizar un atractivo existente
- `DELETE /api/atractivos/:id`: Eliminar un atractivo
- `POST /api/atractivos/:id/imagenes`: Añadir imágenes a un atractivo
- `DELETE /api/atractivos/:id/imagenes/:imagenId`: Eliminar una imagen

Adicionalmente, utiliza:
- `GET /api/categorias`: Para obtener el listado de categorías disponibles
- `GET /api/empresas`: Para obtener el listado de empresas disponibles

## Flujo de Trabajo

1. El administrador navega a la página de gestión desde el menú lateral.
2. Visualiza el listado de atractivos existentes con opciones de filtrado.
3. Puede crear un nuevo atractivo usando el botón "+ Nuevo Atractivo".
4. Para editar, selecciona un atractivo existente y accede al formulario de edición.
5. En el formulario de edición, puede modificar todos los datos y gestionar imágenes.
6. Los cambios se envían a la API y se muestra un mensaje de confirmación.

## Características Especiales

- **Mapa interactivo**: Permite seleccionar la ubicación exacta del atractivo.
- **Galería de imágenes**: Gestión múltiple de imágenes con vista previa.
- **Sugerencias**: Al crear un atractivo, se sugieren categorías basadas en el nombre y descripción.
- **Vista previa**: Botón para ver cómo se mostrará el atractivo en el frontend.

## Gestión de Errores

- Validación de formularios en el lado del cliente.
- Mensajes claros cuando ocurren errores en la API.
- Confirmación antes de operaciones destructivas (eliminación).
- Recuperación automática de datos no guardados en caso de error.

## Consideraciones de Accesibilidad

- Etiquetas descriptivas para todos los campos.
- Mensajes de error específicos para cada campo.
- Navegación por teclado optimizada.
- Contrastes adecuados para texto e interactivos.
