# Documentación de Gestión de Rutas Turísticas - Frontend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de gestión de rutas turísticas permite a los administradores crear, editar, visualizar y eliminar rutas turísticas en la plataforma Turify. Este documento describe la implementación de las páginas y componentes relacionados con la gestión de rutas.

## Páginas Principales

### rutas.astro

- **Ubicación**: `src/pages/admin/rutas.astro`
- **Propósito**: Mostrar un listado de todas las rutas turísticas registradas en el sistema.

- **Funcionalidades**:
  - Listado tabular de rutas con opciones de filtrado.
  - Botones para crear, editar y eliminar rutas.
  - Integración con el panel de administración.
  - Consumo de la API para obtener datos actualizados.

### rutas-nueva.astro

- **Ubicación**: `src/pages/admin/rutas-nueva.astro`
- **Propósito**: Proporcionar un formulario para la creación de nuevas rutas turísticas.

- **Funcionalidades**:
  - Formulario con validación para todos los campos requeridos.
  - Selección de imagen para la ruta.
  - Mensajes de éxito/error tras la creación.
  - Integración con el panel de administración.

### rutas-editar.astro

- **Ubicación**: `src/pages/admin/rutas-editar.astro`
- **Propósito**: Formulario para editar rutas existentes y gestionar sus atractivos asociados.

- **Funcionalidades**:
  - Carga de datos existentes de la ruta seleccionada.
  - Formulario con validación para actualización de datos.
  - Administración de atractivos asociados a la ruta:
    - Listado de atractivos actuales
    - Opción para añadir nuevos atractivos
    - Ordenamiento de atractivos dentro de la ruta
    - Eliminación de atractivos de la ruta
  - Mensajes de confirmación tras actualización.

## Componentes Utilizados

- **AdminPanel.astro**: Layout principal del panel administrativo.
- **TableAdmin.astro**: Componente para mostrar los datos tabulares de rutas.

## Estilos

Los estilos para la sección de rutas se encuentran en:
- **global.css**: Variables y estilos globales
- **paneladmin.css**: Estilos generales del panel de administración
- **form-editar.css**: Estilos específicos para formularios de edición

## Interacción con la API

Las páginas de rutas interactúan con estos endpoints de la API:

- `GET /api/rutas`: Obtener todas las rutas
- `GET /api/rutas/:id`: Obtener detalles de una ruta específica
- `POST /api/rutas`: Crear una nueva ruta
- `PUT /api/rutas/:id`: Actualizar una ruta existente
- `DELETE /api/rutas/:id`: Eliminar una ruta
- `GET /api/rutas/:id/atractivos`: Obtener atractivos asociados a una ruta
- `POST /api/rutas/:id/atractivos`: Asociar un atractivo a la ruta
- `DELETE /api/rutas/:id/atractivos/:atractivoId`: Eliminar un atractivo de la ruta

## Flujo de Trabajo

1. El administrador navega a la página de rutas desde el menú lateral.
2. Visualiza el listado de rutas existentes con opciones de filtrado.
3. Puede crear una nueva ruta usando el botón "+ Nueva Ruta".
4. Para editar, selecciona una ruta existente y accede al formulario de edición.
5. En el formulario de edición, puede modificar datos básicos y gestionar los atractivos asociados.
6. Los cambios se envían a la API y se muestra un mensaje de confirmación.

## Gestión de Errores

- Validación de formularios en el lado del cliente.
- Mensajes claros cuando ocurren errores en la API.
- Confirmación antes de operaciones destructivas (eliminación).

## Funcionalidades Especiales

- Ordenamiento de atractivos dentro de una ruta mediante drag & drop.
- Vista previa de la ruta en un mapa cuando se seleccionan atractivos.
- Cálculo automático de distancia y tiempo estimado según los atractivos seleccionados.
