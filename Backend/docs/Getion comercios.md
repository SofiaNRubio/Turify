## 📄 Documentación técnica de los endpoints `empresas`

### 🧠 Descripción

Se implementaron endpoints REST para gestionar empresas en la base de datos **Turso (SQLite)**. Las rutas permiten crear, listar, ver, actualizar y eliminar registros de empresas. Cada empresa tiene los siguientes campos:

#### 📌 Estructura de la tabla `empresas`

| Campo         | Tipo | Requisitos         |
| ------------- | ---- | ------------------ |
| `id`          | TEXT | PRIMARY KEY (UUID) |
| `nombre`      | TEXT | NOT NULL           |
| `descripcion` | TEXT | Opcional           |
| `email`       | TEXT | Opcional           |
| `telefono`    | TEXT | Opcional           |
| `sitio_web`   | TEXT | Opcional           |
| `direccion`   | TEXT | Opcional           |
| `latitud`     | REAL | Opcional           |
| `longitud`    | REAL | Opcional           |
| `tipo`        | TEXT | Opcional           |

---

### 📌 Endpoints disponibles

#### ✅ POST `/api/empresas`

Crea una nueva empresa.

* **Body JSON:**

```json
{
  "nombre": "EcoHostel",
  "descripcion": "Alojamiento sustentable",
  "email": "info@ecohostel.com",
  "telefono": "2604000000",
  "sitio_web": "https://ecohostel.com",
  "direccion": "Av. San Martín 123",
  "latitud": -34.6000,
  "longitud": -68.3333,
  "tipo": "alojamiento"
}
```

* **Response:** `201 Created`

```json
{
  "id": "uuid-generado",
  "nombre": "EcoHostel"
}
```

---

#### ✅ GET `/api/empresas`

Lista todas las empresas.

* **Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "nombre": "EcoHostel",
    "descripcion": "...",
    ...
  }
]
```

---

#### ✅ GET `/api/empresas/:id`

Obtiene los detalles de una empresa por su ID.

* **Response 200 OK:**

```json
{
  "id": "uuid",
  "nombre": "EcoHostel",
  ...
}
```

* **404 Not Found:**

```json
{ "error": "Empresa no encontrada" }
```

---

#### ✅ PUT `/api/empresas/:id`

Actualiza todos los campos de una empresa.

* **Body JSON:** Igual al POST.
* **Response 200 OK:**

```json
{ "mensaje": "Empresa actualizada" }
```

---

#### ✅ DELETE `/api/empresas/:id`

Elimina una empresa por su ID.

* **Response 200 OK:**

```json
{ "mensaje": "Empresa eliminada" }
```

---

## 🔐 Seguridad

>[!Warning] **Nota importante:**
> Por ahora **los endpoints del backend no están protegidos**, hasta definir cómo se manejará la autenticación/autorización en la API.

