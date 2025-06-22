# Documentación de Rutas API - Turify Backend

**Última actualización:** 22/06/2025

---

## Visión General

El backend de Turify está estructurado siguiendo un patrón de rutas modular donde cada entidad de negocio tiene su propio archivo de rutas. Todas las rutas están configuradas en `index.js` y se conectan a los diferentes controladores.

## Estructura de rutas principales

### `index.js`

Este archivo configura el servidor Express, establece los middlewares necesarios y define las rutas principales de la API:

- **Configuración básica:**
  - Importación de dependencias (express, cors, dotenv)
  - Configuración de Swagger para documentación
  - Configuración de middlewares (CORS, JSON parsing)

- **Rutas API:**
  - `/api/empresas`: Gestión de empresas y comercios
  - `/api/atractivos`: Gestión de atractivos turísticos
  - `/api/categorias`: Gestión de categorías de atractivos
  - `/api/rutas`: Gestión de rutas turísticas
  - `/api/usuarios`: Gestión de usuarios

- **Servidor:**
  - Puerto configurado mediante variables de entorno

## Módulos de rutas

### `empresas.js`

Endpoints para gestionar empresas y comercios:

- `GET /api/empresas`: Obtiene todas las empresas con opciones de filtrado
- `GET /api/empresas/:id`: Obtiene una empresa específica por ID
- `POST /api/empresas`: Crea una nueva empresa
- `PUT /api/empresas/:id`: Actualiza una empresa existente
- `DELETE /api/empresas/:id`: Elimina una empresa

### `gestion.js`

Endpoints para gestionar atractivos turísticos:

- `GET /api/atractivos`: Obtiene todos los atractivos con opciones de filtrado
- `GET /api/atractivos/:id`: Obtiene un atractivo específico por ID
- `POST /api/atractivos`: Crea un nuevo atractivo
- `PUT /api/atractivos/:id`: Actualiza un atractivo existente
- `DELETE /api/atractivos/:id`: Elimina un atractivo

### `categorias.js`

Endpoints para gestionar categorías de atractivos:

- `GET /api/categorias`: Obtiene todas las categorías
- `GET /api/categorias/:id`: Obtiene una categoría específica por ID
- `POST /api/categorias`: Crea una nueva categoría
- `PUT /api/categorias/:id`: Actualiza una categoría existente
- `DELETE /api/categorias/:id`: Elimina una categoría

### `rutas.js`

Endpoints para gestionar rutas turísticas:

- `GET /api/rutas`: Obtiene todas las rutas turísticas
- `GET /api/rutas/:id`: Obtiene una ruta específica por ID
- `POST /api/rutas`: Crea una nueva ruta turística
- `PUT /api/rutas/:id`: Actualiza una ruta existente
- `DELETE /api/rutas/:id`: Elimina una ruta
- `GET /api/rutas/:id/atractivos`: Obtiene los atractivos asociados a una ruta

### `usuarios.js`

Endpoints para gestionar usuarios:

- `GET /api/usuarios/locales`: Obtiene todos los usuarios locales
- `POST /api/usuarios/locales`: Crea un nuevo usuario local
- `PUT /api/usuarios/locales/:id`: Actualiza un usuario local
- `DELETE /api/usuarios/locales/:id`: Elimina un usuario local

## Documentación con Swagger

Todas las rutas están documentadas usando anotaciones Swagger, lo que permite generar automáticamente documentación interactiva de la API accesible en `/api-docs`.
