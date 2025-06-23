# Documentación de Gestión de Empresas - Turify Backend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de gestión de empresas permite administrar los comercios y empresas turísticas registradas en la plataforma Turify. Este documento describe la implementación de las rutas API disponibles en el archivo `empresas.js`.

## Estructura del Módulo

El módulo está implementado como un conjunto de rutas Express en `src/routes/empresas.js` y utiliza la conexión a base de datos definida en `src/db.js`.

## Endpoints Principales

### Obtener todas las empresas

```
GET /api/empresas
```

- **Funcionalidad**: Recupera todas las empresas registradas con opciones de filtrado.
- **Parámetros de consulta**:
  - `nombre`: Filtra empresas por nombre
  - `tipo`: Filtra empresas por tipo (ej. "hotel", "restaurante")
- **Respuesta**: Lista de empresas en formato JSON.

### Obtener una empresa específica

```
GET /api/empresas/:id
```

- **Funcionalidad**: Recupera los datos de una empresa específica por su ID.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la empresa (formato: "emp123")
- **Respuesta**: Datos de la empresa en formato JSON.

### Crear nueva empresa

```
POST /api/empresas
```

- **Funcionalidad**: Crea un nuevo registro de empresa.
- **Cuerpo de la solicitud**: Datos de la empresa (nombre, descripción, email, teléfono, sitio web, dirección, coordenadas y tipo).
- **Proceso**: 
  - Genera un ID único siguiendo el formato "emp" + número secuencial.
  - Utiliza una tabla de seguimiento de IDs para garantizar la unicidad.
- **Respuesta**: Datos de la empresa creada incluyendo su ID.

### Actualizar empresa

```
PUT /api/empresas/:id
```

- **Funcionalidad**: Actualiza los datos de una empresa existente.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la empresa a actualizar
- **Cuerpo de la solicitud**: Datos actualizados de la empresa.
- **Respuesta**: Confirmación de actualización.

### Eliminar empresa

```
DELETE /api/empresas/:id
```

- **Funcionalidad**: Elimina una empresa del sistema.
- **Parámetros de ruta**: 
  - `id`: Identificador único de la empresa a eliminar
- **Respuesta**: Confirmación de eliminación.

## Esquema de Datos

Las empresas siguen este esquema básico:

```json
{
  "id": "emp123",
  "nombre": "Nombre de la Empresa",
  "descripcion": "Descripción detallada",
  "email": "contacto@empresa.com",
  "telefono": "+54 9 123 456 7890",
  "sitio_web": "https://empresa.com",
  "direccion": "Calle Principal 123",
  "latitud": -32.8908,
  "longitud": -68.8272,
  "tipo": "hotel"
}
```

## Implementación Técnica

- Se utiliza un sistema de IDs secuenciales con prefijo para facilitar la identificación.
- Se implementa validación de datos antes de realizar operaciones en la base de datos.
- Todas las consultas a la base de datos se realizan de forma asíncrona.
- Se utiliza manejo de errores para proporcionar respuestas claras al cliente.
