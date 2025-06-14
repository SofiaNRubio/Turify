## 📄 Documentación técnica – Etapa 1: Inicialización del Backend con Express.js

### 📁 Estructura del proyecto

```
turify-backend/
├── .gitignore
├── .env
├── package.json
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── config/
```

---

### 🔧 Configuración y dependencias

* **Inicialización del repositorio Git** con `.gitignore` para evitar subir archivos sensibles o innecesarios (`node_modules`, `.env`, logs, etc).
* **Instalación de dependencias base:**

  * `express`: framework backend.
  * `cors`: manejo de políticas de origen cruzado.
  * `dotenv`: lectura de variables de entorno.
  * `nodemon`: recarga automática en desarrollo.

```bash
npm install express cors dotenv
npm install --save-dev nodemon
```

---

### ⚙️ Configuración del entorno

* Se creó un archivo `.env` con variables sensibles como el puerto, la URL de base de datos y token.

**`.env`:**

```
PORT=3000
DB_URL=sqlite://turso.db
DB_TOKEN=supersecreta123
```

* `dotenv` se usa en `src/index.js` para cargar estas variables automáticamente.

---

### 🧩 Middleware

En `src/index.js` se configuraron:

* `cors()` para permitir solicitudes de otros dominios.
* `express.json()` para parsear cuerpos de peticiones JSON.

---

### 🚀 Script de desarrollo

Se definió un script de desarrollo en el `package.json` para iniciar el servidor con `nodemon`:

```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

Para correr el servidor:

```bash
npm run dev
```

---

### 🔍 Ruta de prueba

Se creó una ruta base (`/`) que responde con un mensaje para verificar que el servidor está funcionando correctamente:

```js
app.get('/', (req, res) => {
  res.send('Turify API funcionando 🚀');
});
```

---

## ✅ Commit sugerido

```bash
git add .
git commit -m "Inicializa backend con Express: estructura base, middlewares, .env, script de desarrollo y ruta de prueba"
```