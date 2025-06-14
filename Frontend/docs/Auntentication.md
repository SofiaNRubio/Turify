## 🔑 Sistema de login (frontend)

Se implementó **Clerk** para login en el frontend. Se agregó:

* Middleware de Clerk en `src/middleware.ts` para proteger rutas `/admin`.
* Validación del rol admin a través de `private_metadata.permission === "admin"` usando la API de Clerk.
* Redirección automática a `/sign-in` si el usuario no está autenticado.
* Protección contra acceso no autorizado (`403`) en rutas de administración.

