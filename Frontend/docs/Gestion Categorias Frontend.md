# Documentación de Gestión de Categorías - Frontend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de gestión de categorías permite a los administradores crear, editar, visualizar y eliminar las categorías de atractivos turísticos en la plataforma Turify. Este documento describe la implementación de las páginas y componentes relacionados con la gestión de categorías.

## Páginas Principales

### categorias.astro

- **Ubicación**: `src/pages/admin/categorias.astro`
- **Propósito**: Mostrar un listado de todas las categorías registradas en el sistema.

- **Funcionalidades**:
  - Listado tabular de categorías con imagen de previsualización.
  - Botones para crear, editar y eliminar categorías.
  - Integración con el panel de administración.
  - Consumo de la API para obtener datos actualizados.

### categorias-nueva.astro

- **Ubicación**: `src/pages/admin/categorias-nueva.astro`
- **Propósito**: Proporcionar un formulario para la creación de nuevas categorías.

- **Funcionalidades**:
  - Formulario con validación para todos los campos requeridos.
  - Carga de imagen representativa para la categoría.
  - Mensajes de éxito/error tras la creación.
  - Integración con el panel de administración.

### categorias-editar.astro

- **Ubicación**: `src/pages/admin/categorias-editar.astro`
- **Propósito**: Formulario para editar categorías existentes.

- **Funcionalidades**:
  - Carga de datos existentes de la categoría seleccionada.
  - Formulario con validación para actualización de datos.
  - Previsualización de la imagen actual con opción de cambiarla.
  - Mensajes de confirmación tras actualización.
  - Indicador de cuántos atractivos usan esta categoría.

## Componentes Utilizados

- **AdminPanel.astro**: Layout principal del panel administrativo.
- **TableAdmin.astro**: Componente para mostrar los datos tabulares de categorías.

## Estilos

Los estilos para la sección de categorías se encuentran en:
- **global.css**: Variables y estilos globales
- **paneladmin.css**: Estilos generales del panel de administración
- **categorias.css**: Estilos específicos para la visualización y gestión de categorías
- **form-editar.css**: Estilos compartidos para formularios de edición

## Interacción con la API

Las páginas de categorías interactúan con estos endpoints de la API:

- `GET /api/categorias`: Obtener todas las categorías
- `GET /api/categorias/:id`: Obtener detalles de una categoría específica
- `POST /api/categorias`: Crear una nueva categoría
- `PUT /api/categorias/:id`: Actualizar una categoría existente
- `DELETE /api/categorias/:id`: Eliminar una categoría

## Flujo de Trabajo

1. El administrador navega a la página de categorías desde el menú lateral.
2. Visualiza el listado de categorías existentes.
3. Puede crear una nueva categoría usando el botón "+ Nueva Categoría".
4. Para editar, selecciona una categoría existente y accede al formulario de edición.
5. En el formulario de edición, puede modificar nombre, descripción e imagen.
6. Los cambios se envían a la API y se muestra un mensaje de confirmación.

## Características Visuales

- Previsualización de imágenes de categorías en formato thumbnail.
- Indicadores visuales para categorías más utilizadas.
- Uso de iconos descriptivos junto a los nombres de categorías.
- Paleta de colores que corresponde con la identidad visual de Turify.

## Gestión de Errores

- Validación de formularios en el lado del cliente.
- Mensajes claros cuando ocurren errores en la API.
- Confirmación antes de operaciones destructivas (eliminación).
- Prevención de eliminación para categorías que tienen atractivos asociados.

## Consideraciones Técnicas

- Optimización de imágenes al subirlas para mejorar el rendimiento.
- Almacenamiento de imágenes con nombres únicos para evitar colisiones.
- Validación de tipos MIME para garantizar que solo se suban imágenes.
- Gestión de caché para mejorar la velocidad de carga de imágenes frecuentemente accedidas.
