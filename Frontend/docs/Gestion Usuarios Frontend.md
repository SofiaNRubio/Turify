# Documentación de Gestión de Usuarios - Frontend

**Última actualización:** 22/06/2025

---

## Visión General

El módulo de gestión de usuarios permite a los administradores visualizar, crear, editar y eliminar cuentas de usuario en la plataforma Turify. Este documento describe la implementación de las páginas y componentes relacionados con la gestión de usuarios.

## Páginas Principales

### usuarios.astro

- **Ubicación**: `src/pages/admin/usuarios.astro`
- **Propósito**: Mostrar un listado de todos los usuarios registrados en el sistema y permitir su gestión.

- **Funcionalidades**:
  - Listado tabular de usuarios con información básica (nombre, email, rol).
  - Filtrado por nombre y email.
  - Botones para crear, editar y eliminar usuarios.
  - Distinción visual entre usuarios locales y externos (autenticados mediante servicios terceros).
  - Integración con el panel de administración.
  - Consumo de la API para obtener datos actualizados.

## Componentes Utilizados

- **AdminPanel.astro**: Layout principal del panel administrativo.
- **TableAdmin.astro**: Componente para mostrar los datos tabulares de usuarios.

## Estilos

Los estilos para la sección de usuarios se encuentran en:
- **global.css**: Variables y estilos globales
- **paneladmin.css**: Estilos generales del panel de administración
- **modal.css**: Estilos para modales (formularios de creación/edición, confirmaciones)

## Interacción con la API

La página de usuarios interactúa con estos endpoints de la API:

- `GET /api/usuarios/locales`: Obtener todos los usuarios locales
- `GET /api/usuarios/locales/:id`: Obtener detalles de un usuario específico
- `POST /api/usuarios/locales`: Crear un nuevo usuario local
- `PUT /api/usuarios/locales/:id`: Actualizar un usuario existente
- `DELETE /api/usuarios/locales/:id`: Eliminar un usuario

## Flujo de Trabajo

1. El administrador navega a la página de usuarios desde el menú lateral.
2. Visualiza el listado de usuarios existentes con opciones de filtrado.
3. Puede crear un nuevo usuario usando el botón correspondiente.
4. Para editar, selecciona un usuario existente y accede al modal de edición.
5. La eliminación de usuarios requiere confirmación.
6. Los cambios se envían a la API y se muestra un mensaje de confirmación.

## Formularios de Usuario

### Creación de Usuario

El formulario para crear usuarios incluye:
- Nombre completo
- Dirección de correo electrónico
- Contraseña (con requisitos de seguridad)
- Confirmación de contraseña
- Selección de rol (administrador, editor, usuario)

### Edición de Usuario

El formulario para editar usuarios incluye:
- Nombre completo
- Dirección de correo electrónico
- Opción para cambiar la contraseña (opcional)
- Selección de rol

## Roles de Usuario

El sistema maneja estos roles principales:
- **Administrador**: Acceso completo a todas las funcionalidades.
- **Editor**: Puede gestionar contenido pero no usuarios ni configuraciones.
- **Usuario**: Acceso básico a la plataforma sin privilegios administrativos.

## Gestión de Errores

- Validación de formularios en el lado del cliente.
- Mensajes claros cuando ocurren errores en la API.
- Confirmación antes de operaciones destructivas (eliminación).
- Validación de formato de email y requisitos de contraseña.

## Seguridad

- Las contraseñas nunca se muestran en la interfaz.
- La transmisión de datos sensibles se realiza de forma segura.
- Se implementan medidas para prevenir la eliminación accidental de cuentas administrativas críticas.
- Mensajes de error genéricos para evitar fugas de información.

## Consideraciones Especiales

- Usuarios externos (autenticados mediante servicios terceros) no pueden ser editados completamente desde esta interfaz.
- Solo los administradores pueden modificar roles de usuario.
- Se muestra el estado de actividad de cada usuario (activo/inactivo).
- Se proporciona una opción para desactivar temporalmente usuarios sin eliminarlos.
