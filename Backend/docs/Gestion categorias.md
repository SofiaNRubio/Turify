# Documentación de Categorías - Turify Backend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de categorías permite gestionar las diferentes clasificaciones de atractivos turísticos en la plataforma Turify. Este documento describe la implementación de las rutas API disponibles en el archivo `categorias.js`.

## Estructura del Módulo

El módulo está implementado como un conjunto de rutas Express en `src/routes/categorias.js` y utiliza la conexión a base de datos definida en `src/db.js`.

## Endpoints Principales

### Obtener todas las categorías

```
GET /api/categorias
```

- **Funcionalidad**: Recupera todas las categorías registradas con opciones de filtrado.
- **Parámetros de consulta**:
  - `nombre`: Filtra categorías por nombre
- **Respuesta**: Lista de categorías en formato JSON.
- **Orden**: Las categorías se ordenan por ID numéricamente.

### Obtener una categoría específica

```
GET /api/categorias/:id
```

- **Funcionalidad**: Recupera los datos de una categoría específica por su ID.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la categoría (formato: "cat123")
- **Respuesta**: Datos de la categoría en formato JSON.

### Crear nueva categoría

```
POST /api/categorias
```

- **Funcionalidad**: Crea un nuevo registro de categoría.
- **Cuerpo de la solicitud**: Datos de la categoría (nombre, descripción e imagen).
- **Proceso**: 
  - Genera un ID único siguiendo el formato "cat" + número secuencial.
  - Utiliza una tabla de seguimiento de IDs para garantizar la unicidad.
- **Respuesta**: Datos de la categoría creada incluyendo su ID.

### Actualizar categoría

```
PUT /api/categorias/:id
```

- **Funcionalidad**: Actualiza los datos de una categoría existente.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la categoría a actualizar
- **Cuerpo de la solicitud**: Datos actualizados de la categoría.
- **Respuesta**: Confirmación de actualización.

### Eliminar categoría

```
DELETE /api/categorias/:id
```

- **Funcionalidad**: Elimina una categoría del sistema.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la categoría a eliminar
- **Restricciones**:
  - No se puede eliminar una categoría que tenga atractivos asociados.
- **Respuesta**: Confirmación de eliminación.

## Esquema de Datos

Las categorías siguen este esquema básico:

```json
{
  "id": "cat123",
  "nombre": "Gastronomía",
  "descripcion": "Lugares para disfrutar la comida local",
  "imagen": "gastronomia.jpg"
}
```

## Implementación Técnica

- Se utiliza un sistema de IDs secuenciales con prefijo "cat" para facilitar la identificación.
- Se implementa validación de datos antes de realizar operaciones en la base de datos.
- Todas las consultas a la base de datos se realizan de forma asíncrona.
- Se utiliza manejo de errores para proporcionar respuestas claras al cliente.
- Se verifica la existencia de atractivos asociados antes de permitir la eliminación.
