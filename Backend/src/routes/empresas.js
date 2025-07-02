import express from "express";
import { db } from "../db.js";
import { randomUUID } from "crypto";

const router = express.Router();

// Crear empresa
router.post("/", async (req, res) => {
    const {
        nombre,
        descripcion,
        email,
        telefono,
        sitio_web,
        direccion,
        distrito,
        latitud,
        longitud,
        img_url,
        categoria_id,
    } = req.body;

    try {
        // Validar campos requeridos
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!descripcion || descripcion.trim() === "") {
            return res
                .status(400)
                .json({ error: "La descripción es obligatoria" });
        }

        // Validar coordenadas
        const lat = parseFloat(latitud);
        const lng = parseFloat(longitud);

        if (isNaN(lat) || !isFinite(lat)) {
            return res
                .status(400)
                .json({ error: "La latitud debe ser un número válido" });
        }

        if (isNaN(lng) || !isFinite(lng)) {
            return res
                .status(400)
                .json({ error: "La longitud debe ser un número válida" });
        }

        // Generar UUID para la empresa
        const id = `emp-${randomUUID()}`;

        await db.execute({
            sql: `INSERT INTO empresas 
        (id, nombre, descripcion, email, telefono, sitio_web, direccion, distrito, latitud, longitud, img_url, categoria_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
                distrito,
                lat,
                lng,
                img_url,
                categoria_id,
            ],
        });

        res.status(201).json({ id, nombre });
    } catch (err) {
        console.error("Error al crear empresa:", err);
        res.status(500).json({ error: "Error al crear empresa" });
    }
});

// Obtener distritos únicos
router.get("/distritos", async (req, res) => {
    try {
        let sql = "SELECT DISTINCT distrito FROM empresas WHERE distrito IS NOT NULL AND distrito != ''";
        const args = [];

        // Filtrar por categoría si se proporciona
        if (req.query.categoria_id) {
            sql += " AND categoria_id = ?";
            args.push(req.query.categoria_id);
        }

        sql += " ORDER BY distrito";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        const distritos = result.rows
            .map(row => row.distrito)
            .filter(distrito => distrito && distrito.trim() !== '');

        res.json(distritos);
    } catch (err) {
        console.error("Error al obtener distritos:", err);
        res.status(500).json({ error: "Error al obtener distritos" });
    }
});

// Listar todas las empresas
router.get("/", async (req, res) => {
    try {
        let sql = "SELECT * FROM empresas WHERE 1=1";
        const args = [];

        // Filtrar por distrito si se proporciona
        if (req.query.distrito) {
            sql += " AND distrito LIKE ?";
            args.push(`%${req.query.distrito}%`);
        }

        // Ordenar por nombre
        sql += " ORDER BY nombre";

        const result = await db.execute({
            sql: sql,
            args: args,
        });
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener empresas:", err);
        res.status(500).json({ error: "Error al obtener empresas" });
    }
});

// Obtener una empresa por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener empresa:", err);
        res.status(500).json({ error: "Error al obtener empresa" });
    }
});

// Actualizar empresa por ID
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        descripcion,
        email,
        telefono,
        sitio_web,
        direccion,
        distrito,
        latitud,
        longitud,
        img_url,
        categoria_id,
    } = req.body;

    try {
        // Validar campos requeridos
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!descripcion || descripcion.trim() === "") {
            return res
                .status(400)
                .json({ error: "La descripción es obligatoria" });
        }

        // Validar coordenadas si están presentes
        let lat = latitud;
        let lng = longitud;

        if (latitud !== undefined && latitud !== null) {
            lat = parseFloat(latitud);
            if (isNaN(lat) || !isFinite(lat)) {
                return res
                    .status(400)
                    .json({ error: "La latitud debe ser un número válido" });
            }
        }

        if (longitud !== undefined && longitud !== null) {
            lng = parseFloat(longitud);
            if (isNaN(lng) || !isFinite(lng)) {
                return res
                    .status(400)
                    .json({ error: "La longitud debe ser un número válida" });
            }
        }

        const result = await db.execute({
            sql: `UPDATE empresas SET 
        nombre = ?, descripcion = ?, email = ?, telefono = ?, sitio_web = ?, direccion = ?, distrito = ?, latitud = ?, longitud = ?, img_url = ?, categoria_id = ?
        WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
                distrito,
                lat,
                lng,
                img_url,
                categoria_id,
                id,
            ],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json({ mensaje: "Empresa actualizada" });
    } catch (err) {
        console.error("Error al actualizar empresa:", err);
        res.status(500).json({ error: "Error al actualizar empresa" });
    }
});

// Eliminar empresa por ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`Solicitud de eliminación para empresa con ID: ${id}`);

    try {
        // Verificar que la empresa existe
        const empresaCheck = await db.execute({
            sql: "SELECT id, nombre FROM empresas WHERE id = ?",
            args: [id],
        });
        
        if (empresaCheck.rows.length === 0) {
            console.log(`Empresa con ID ${id} no encontrada en la base de datos`);
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        const nombreEmpresa = empresaCheck.rows[0].nombre;
        console.log(`Eliminando empresa: ${nombreEmpresa} (ID: ${id})`);
        
        // Identificar primero los atractivos relacionados con esta empresa
        const atractivos = await db.execute({
            sql: "SELECT id, nombre FROM atractivos WHERE empresa_id = ?",
            args: [id],
        });
        
        console.log(`Encontrados ${atractivos.rows.length} atractivos asociados a esta empresa`);

        // Para cada atractivo, eliminar registros relacionados
        for (const atractivo of atractivos.rows) {
            const atractivoId = atractivo.id;
            const atractivoNombre = atractivo.nombre;
            console.log(`Procesando atractivo: ${atractivoNombre} (ID: ${atractivoId})`);

            // Eliminar referencias en rutas_atractivos
            console.log(`  - Eliminando referencias en rutas_atractivos...`);
            await db.execute({
                sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Eliminar reseñas relacionadas
            console.log(`  - Eliminando reseñas relacionadas...`);
            await db.execute({
                sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Eliminar favoritos relacionados
            console.log(`  - Eliminando favoritos relacionados...`);
            await db.execute({
                sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Finalmente eliminar el atractivo
            console.log(`  - Eliminando el atractivo...`);
            await db.execute({
                sql: "DELETE FROM atractivos WHERE id = ?",
                args: [atractivoId],
            });
            console.log(`  - Atractivo eliminado correctamente`);
        }

        // Finalmente, eliminar la empresa
        console.log(`Eliminando la empresa: ${nombreEmpresa}...`);
        const result = await db.execute({
            sql: "DELETE FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            console.log(`Error: Empresa con ID ${id} no pudo ser eliminada`);
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        console.log(`Empresa "${nombreEmpresa}" (ID: ${id}) y sus ${atractivos.rows.length} atractivos eliminados exitosamente`);
        res.json({
            mensaje: `Empresa "${nombreEmpresa}" y sus ${atractivos.rows.length} atractivos eliminados exitosamente`,
        });
    } catch (err) {
        console.error("Error al eliminar empresa:", err);
        res.status(500).json({ 
            error: "Error al eliminar empresa",
            detalle: err.message || "Error desconocido"
        });
    }
});
/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Crea una nueva empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - email
 *               - telefono
 *               - sitio_web
 *               - direccion
 *               - latitud
 *               - longitud
 *               - img_url
 *               - categoria_id
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               sitio_web:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               img_url:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Empresa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *       '500':
 *         description: Error al crear empresa
 */

/**
 * @swagger
 * /api/empresas:
 *   get:
 *     summary: Obtiene la lista de todas las empresas
 *     tags: [Empresas]
 *     responses:
 *       '200':
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /api/empresas/{id}:
 *   get:
 *     summary: Obtiene una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa
 *     responses:
 *       '200':
 *         description: Datos de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '404':
 *         description: Empresa no encontrada
 */

/**
 * @swagger
 * /api/empresas/{id}:
 *   put:
 *     summary: Actualiza una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               sitio_web:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               img_url:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Empresa actualizada
 *       '404':
 *         description: Empresa no encontrada
 *       '500':
 *         description: Error al actualizar empresa
 */

/**
 * @swagger
 * /api/empresas/{id}:
 *   delete:
 *     summary: Elimina una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa a eliminar
 *     responses:
 *       '200':
 *         description: Empresa eliminada
 *       '404':
 *         description: Empresa no encontrada
 *       '500':
 *         description: Error al eliminar empresa
 */

export default router;
