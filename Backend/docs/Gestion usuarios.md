# Documentación de Gestión de Usuarios - Turify Backend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de usuarios permite gestionar las cuentas de usuario en la plataforma Turify, específicamente los usuarios locales (creados directamente en la aplicación, no mediante autenticación externa). Este documento describe la implementación de las rutas API disponibles en el archivo `usuarios.js`.

## Estructura del Módulo

El módulo está implementado como un conjunto de rutas Express en `src/routes/usuarios.js` y utiliza la conexión a base de datos definida en `src/db.js`.

## Endpoints Principales

### Obtener todos los usuarios locales

```
GET /api/usuarios/locales
```

- **Funcionalidad**: Recupera todos los usuarios locales registrados con opciones de filtrado.
- **Parámetros de consulta**:
  - `nombre`: Filtra usuarios por nombre
  - `email`: Filtra usuarios por dirección de correo electrónico
- **Respuesta**: Lista de usuarios en formato JSON con los campos id, nombre, email y rol.
- **Seguridad**: Las contraseñas no se devuelven en la respuesta.

### Obtener un usuario específico

```
GET /api/usuarios/locales/:id
```

- **Funcionalidad**: Recupera los datos de un usuario específico por su ID.
- **Parámetros de ruta**: 
  - `id`: Identificador único del usuario
- **Respuesta**: Datos del usuario en formato JSON sin incluir la contraseña.

### Crear nuevo usuario

```
POST /api/usuarios/locales
```

- **Funcionalidad**: Crea un nuevo registro de usuario local.
- **Cuerpo de la solicitud**: Datos del usuario (nombre, email, contraseña y rol).
- **Proceso**: 
  - Verifica que el email no esté ya registrado.
  - Realiza el hash de la contraseña antes de almacenarla.
  - Genera un ID único para el usuario.
- **Respuesta**: Datos del usuario creado incluyendo su ID (sin contraseña).

### Actualizar usuario

```
PUT /api/usuarios/locales/:id
```

- **Funcionalidad**: Actualiza los datos de un usuario existente.
- **Parámetros de ruta**: 
  - `id`: Identificador único del usuario a actualizar
- **Cuerpo de la solicitud**: Datos actualizados del usuario.
- **Proceso**:
  - Si se actualiza la contraseña, se genera un nuevo hash.
  - Verifica que el email no esté en uso por otro usuario si se modifica.
- **Respuesta**: Confirmación de actualización.

### Eliminar usuario

```
DELETE /api/usuarios/locales/:id
```

- **Funcionalidad**: Elimina un usuario del sistema.
- **Parámetros de ruta**: 
  - `id`: Identificador único del usuario a eliminar
- **Respuesta**: Confirmación de eliminación.

## Esquema de Datos

Los usuarios siguen este esquema básico:

```json
{
  "id": "usr123",
  "nombre": "Nombre Completo",
  "email": "usuario@ejemplo.com",
  "contraseña": "[hash protegido]",
  "rol": "admin|editor|usuario"
}
```

## Seguridad

- Las contraseñas nunca se almacenan en texto plano, siempre se utiliza un algoritmo de hash seguro.
- La información sensible como las contraseñas nunca se devuelve en las respuestas API.
- Se valida que los emails sean únicos para evitar suplantación de identidad.
- Los roles determinan los permisos de acceso a diferentes funcionalidades del sistema.

## Implementación Técnica

- Se utiliza validación de datos antes de realizar operaciones en la base de datos.
- Todas las consultas a la base de datos se realizan de forma asíncrona.
- Se utiliza manejo de errores para proporcionar respuestas claras al cliente sin exponer información sensible.
