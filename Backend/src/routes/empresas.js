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
        (id, nombre, descripcion, email, telefono, sitio_web, direccion, latitud, longitud, img_url, categoria_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
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

// Listar todas las empresas
router.get("/", async (_req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM empresas",
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
        nombre = ?, descripcion = ?, email = ?, telefono = ?, sitio_web = ?, direccion = ?, latitud = ?, longitud = ?, img_url = ?, categoria_id = ?
        WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
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

    try {
        // Identificar primero los atractivos relacionados con esta empresa
        const atractivos = await db.execute({
            sql: "SELECT id FROM atractivos WHERE empresa_id = ?",
            args: [id],
        });

        // Para cada atractivo, eliminar registros relacionados
        for (const atractivo of atractivos.rows) {
            const atractivoId = atractivo.id;

            // Eliminar referencias en rutas_atractivos
            await db.execute({
                sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Eliminar reseñas relacionadas
            await db.execute({
                sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Eliminar favoritos relacionados
            await db.execute({
                sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
                args: [atractivoId],
            });

            // Eliminar imágenes relacionadas con el atractivo
            // Esta línea se puede comentar ya que no existe tabla imagenes en el esquema
            // await db.execute({
            //     sql: "DELETE FROM imagenes WHERE entidad_tipo = 'atractivo' AND entidad_id = ?",
            //     args: [atractivoId],
            // });

            // Finalmente eliminar el atractivo
            await db.execute({
                sql: "DELETE FROM atractivos WHERE id = ?",
                args: [atractivoId],
            });
        }

        // Eliminar imágenes relacionadas con la empresa
        // Esta línea se puede comentar ya que no existe tabla imagenes en el esquema
        // await db.execute({
        //     sql: "DELETE FROM imagenes WHERE entidad_tipo = 'empresa' AND entidad_id = ?",
        //     args: [id],
        // });

        // Finalmente, eliminar la empresa
        const result = await db.execute({
            sql: "DELETE FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json({
            mensaje: "Empresa y sus atractivos eliminados exitosamente",
        });
    } catch (err) {
        console.error("Error al eliminar empresa:", err);
        res.status(500).json({ error: "Error al eliminar empresa" });
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
