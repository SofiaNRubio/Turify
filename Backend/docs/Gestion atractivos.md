# Atractivos Turísticos API

Este archivo describe los endpoints de la API para gestionar atractivos turísticos.

## Endpoints

### Crear un atractivo

**POST** `/api/atractivos`

Crea un nuevo atractivo turístico.

**Body:**
```json
{
  "nombre": "String",
  "descripcion": "String",
  "empresa_id": "String (UUID)",
  "categoria_id": "String (UUID)",
  "latitud": "Number",
  "longitud": "Number",
  "direccion": "String"
}
```

**Respuesta:**
```json
{
  "id": "UUID generado",
  "nombre": "Nombre del atractivo"
}
```

### Listar atractivos

**GET** `/api/atractivos`

Obtiene todos los atractivos turísticos. Permite filtrar por nombre, empresa_id y categoria_id.

**Parámetros de consulta:**
- `nombre`: Filtrar por nombre (búsqueda parcial)
- `empresa_id`: Filtrar por ID de empresa
- `categoria_id`: Filtrar por ID de categoría

**Respuesta:**
```json
[
  {
    "id": "UUID",
    "nombre": "Nombre del atractivo",
    "descripcion": "Descripción",
    "empresa_id": "ID de empresa",
    "empresa_nombre": "Nombre de la empresa",
    "categoria_id": "ID de categoría",
    "categoria_nombre": "Nombre de la categoría",
    "latitud": 123.456,
    "longitud": 789.012,
    "direccion": "Dirección",
    "creado_en": "Fecha de creación"
  },
  // ... más atractivos
]
```

### Obtener un atractivo

**GET** `/api/atractivos/:id`

Obtiene los detalles de un atractivo turístico específico.

**Respuesta:**
```json
{
  "id": "UUID",
  "nombre": "Nombre del atractivo",
  "descripcion": "Descripción",
  "empresa_id": "ID de empresa",
  "empresa_nombre": "Nombre de la empresa",
  "categoria_id": "ID de categoría",
  "categoria_nombre": "Nombre de la categoría",
  "latitud": 123.456,
  "longitud": 789.012,
  "direccion": "Dirección",
  "creado_en": "Fecha de creación",
  "imagenes": [
    {
      "id": "UUID",
      "url": "URL de la imagen",
      "descripcion": "Descripción de la imagen",
      "posicion": 0
    }
    // ... más imágenes
  ]
}
```

### Actualizar un atractivo

**PUT** `/api/atractivos/:id`

Actualiza un atractivo turístico existente.

**Body:**
```json
{
  "nombre": "String",
  "descripcion": "String",
  "empresa_id": "String (UUID)",
  "categoria_id": "String (UUID)",
  "latitud": "Number",
  "longitud": "Number",
  "direccion": "String"
}
```

**Respuesta:**
```json
{
  "mensaje": "Atractivo actualizado exitosamente"
}
```

### Eliminar un atractivo

**DELETE** `/api/atractivos/:id`

Elimina un atractivo turístico y todas sus relaciones (imágenes, reseñas, favoritos, rutas).

**Respuesta:**
```json
{
  "mensaje": "Atractivo eliminado exitosamente"
}
```
