# Documentación de Rutas Turísticas - Turify Backend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de rutas turísticas permite gestionar los recorridos sugeridos que incluyen múltiples atractivos en la plataforma Turify. Este documento describe la implementación de las rutas API disponibles en el archivo `rutas.js`.

## Estructura del Módulo

El módulo está implementado como un conjunto de rutas Express en `src/routes/rutas.js` y utiliza la conexión a base de datos definida en `src/db.js`.

## Endpoints Principales

### Obtener todas las rutas

```
GET /api/rutas
```

- **Funcionalidad**: Recupera todas las rutas turísticas registradas con opciones de filtrado.
- **Parámetros de consulta**:
  - `nombre`: Filtra rutas por nombre
- **Respuesta**: Lista de rutas en formato JSON.
- **Orden**: Las rutas se ordenan por ID numéricamente.

### Obtener una ruta específica

```
GET /api/rutas/:id
```

- **Funcionalidad**: Recupera los datos de una ruta específica por su ID.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la ruta (formato: "ruta123")
- **Respuesta**: Datos de la ruta en formato JSON.

### Crear nueva ruta

```
POST /api/rutas
```

- **Funcionalidad**: Crea un nuevo registro de ruta turística.
- **Cuerpo de la solicitud**: Datos de la ruta (nombre, descripción, duración, distancia, imagen).
- **Proceso**: 
  - Genera un ID único siguiendo el formato "ruta" + número secuencial.
  - Utiliza una tabla de seguimiento de IDs para garantizar la unicidad.
- **Respuesta**: Datos de la ruta creada incluyendo su ID.

### Actualizar ruta

```
PUT /api/rutas/:id
```

- **Funcionalidad**: Actualiza los datos de una ruta existente.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la ruta a actualizar
- **Cuerpo de la solicitud**: Datos actualizados de la ruta.
- **Respuesta**: Confirmación de actualización.

### Eliminar ruta

```
DELETE /api/rutas/:id
```

- **Funcionalidad**: Elimina una ruta del sistema.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la ruta a eliminar
- **Respuesta**: Confirmación de eliminación.

### Obtener atractivos de una ruta

```
GET /api/rutas/:id/atractivos
```

- **Funcionalidad**: Recupera todos los atractivos asociados a una ruta turística.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la ruta
- **Respuesta**: Lista de atractivos asociados a la ruta.

### Asociar atractivo a una ruta

```
POST /api/rutas/:id/atractivos
```

- **Funcionalidad**: Asocia un atractivo turístico a una ruta.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la ruta
- **Cuerpo de la solicitud**: 
  - `atractivo_id`: ID del atractivo a asociar
  - `orden`: Orden de visita del atractivo en la ruta
- **Respuesta**: Confirmación de asociación.

### Eliminar atractivo de una ruta

```
DELETE /api/rutas/:rutaId/atractivos/:atractivoId
```

- **Funcionalidad**: Elimina la asociación entre un atractivo y una ruta.
- **Parámetros de ruta**: 
  - `rutaId`: Identificador único de la ruta
  - `atractivoId`: Identificador único del atractivo
- **Respuesta**: Confirmación de eliminación.

## Esquema de Datos

Las rutas turísticas siguen este esquema básico:

```json
{
  "id": "ruta123",
  "nombre": "Ruta del Vino",
  "descripcion": "Recorrido por las mejores bodegas",
  "duracion": "4 horas",
  "distancia": "25 km",
  "imagen": "ruta-vino.jpg"
}
```

## Implementación Técnica

- Se utiliza UUID para gestionar las relaciones entre rutas y atractivos.
- Se utiliza un sistema de IDs secuenciales con prefijo "ruta" para facilitar la identificación.
- Se implementa validación de datos antes de realizar operaciones en la base de datos.
- Todas las consultas a la base de datos se realizan de forma asíncrona.
- Se utiliza manejo de errores para proporcionar respuestas claras al cliente.
