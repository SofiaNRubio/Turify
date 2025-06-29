import { db } from "../db.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Atractivos
 *   description: Endpoints para gestionar atractivos turísticos
 */

/**
 * @swagger
 * /api/atractivos:
 *   get:
 *     summary: Obtiene todos los atractivos
 *     tags: [Atractivos]
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de empresa
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del atractivo
 *     responses:
 *       200:
 *         description: Lista de atractivos
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        let sql = "SELECT * FROM atractivos WHERE 1=1";
        const args = [];

        // Filtrar por empresa_id si se proporciona
        if (req.query.empresa_id) {
            sql += " AND empresa_id = ?";
            args.push(req.query.empresa_id);
        }

        // Filtrar por categoria_id si se proporciona
        if (req.query.categoria_id) {
            sql += " AND categoria_id = ?";
            args.push(req.query.categoria_id);
        }

        // Filtrar por nombre si se proporciona
        if (req.query.nombre) {
            sql += " AND nombre LIKE ?";
            args.push(`%${req.query.nombre}%`);
        }

        // Ordenar por fecha de creación
        sql += " ORDER BY creado_en DESC";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener atractivos:", err);
        res.status(500).json({ error: "Error al obtener atractivos" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   get:
 *     summary: Obtiene un atractivo por su ID
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
 *     responses:
 *       200:
 *         description: Datos del atractivo
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.execute({
            sql: "SELECT * FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener atractivo:", err);
        res.status(500).json({ error: "Error al obtener atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos:
 *   post:
 *     summary: Crea un nuevo atractivo
 *     tags: [Atractivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - empresa_id
 *               - categoria_id
 *               - latitud
 *               - longitud
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               empresa_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               direccion:
 *                 type: string
 *               img_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atractivo creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", async (req, res) => {
    const {
        nombre,
        descripcion,
        empresa_id,
        categoria_id,
        latitud,
        longitud,
        direccion,
        img_url,
    } = req.body;

    if (
        !nombre ||
        !descripcion ||
        !empresa_id ||
        !categoria_id ||
        !latitud ||
        !longitud ||
        !direccion
    ) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    try {
        // Crear tabla de seguimiento si no existe
        try {
            await db.execute({
                sql: `CREATE TABLE IF NOT EXISTS id_tracking (
                    tipo TEXT NOT NULL,
                    ultimo_numero INTEGER NOT NULL,
                    PRIMARY KEY (tipo)
                )`,
            });
        } catch (createErr) {
            console.error("Error al crear tabla de seguimiento:", createErr);
        }

        // Obtener el próximo número para atractivos
        let nextNum = 1;

        const trackingResult = await db.execute({
            sql: "SELECT ultimo_numero FROM id_tracking WHERE tipo = 'atractivo'",
        });

        if (trackingResult.rows.length > 0) {
            nextNum = trackingResult.rows[0].ultimo_numero + 1;
        } else {
            const lastIdResult = await db.execute({
                sql: "SELECT id FROM atractivos WHERE id LIKE 'atr%' ORDER BY CAST(SUBSTR(id, 4) AS INTEGER) DESC LIMIT 1",
            });

            if (lastIdResult.rows.length > 0) {
                const lastId = lastIdResult.rows[0].id;
                const lastNum = parseInt(lastId.replace("atr", ""));
                nextNum = lastNum + 1;
            }

            await db.execute({
                sql: "INSERT INTO id_tracking (tipo, ultimo_numero) VALUES (?, ?)",
                args: ["atractivo", nextNum],
            });
        }

        const id = `atr${nextNum}`;

        await db.execute({
            sql: `INSERT INTO atractivos (id, nombre, descripcion, empresa_id, categoria_id, latitud, longitud, direccion, img_url)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                img_url,
            ],
        });

        // Actualizar contador
        await db.execute({
            sql: "UPDATE id_tracking SET ultimo_numero = ? WHERE tipo = ?",
            args: [nextNum, "atractivo"],
        });

        res.status(201).json({
            id,
            nombre,
            mensaje: "Atractivo creado exitosamente",
        });
    } catch (err) {
        console.error("Error al crear atractivo:", err);
        res.status(500).json({ error: "Error al crear atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   put:
 *     summary: Actualiza un atractivo existente
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
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
 *               empresa_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               direccion:
 *                 type: string
 *               img_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atractivo actualizado exitosamente
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        descripcion,
        empresa_id,
        categoria_id,
        latitud,
        longitud,
        direccion,
        img_url,
    } = req.body;

    try {
        // Verificar si el atractivo existe
        const checkResult = await db.execute({
            sql: "SELECT * FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        // Actualizar el atractivo
        const result = await db.execute({
            sql: `UPDATE atractivos SET 
                  nombre = ?, descripcion = ?, empresa_id = ?, categoria_id = ?, 
                  latitud = ?, longitud = ?, direccion = ?, img_url = ?
                  WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                img_url,
                id,
            ],
        });

        res.json({ id, mensaje: "Atractivo actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar atractivo:", err);
        res.status(500).json({ error: "Error al actualizar atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   delete:
 *     summary: Elimina un atractivo por su ID
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
 *     responses:
 *       200:
 *         description: Atractivo eliminado exitosamente
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar referencias en rutas_atractivos
        await db.execute({
            sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar reseñas relacionadas
        await db.execute({
            sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar favoritos relacionados
        await db.execute({
            sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar el atractivo
        const result = await db.execute({
            sql: "DELETE FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        res.json({ mensaje: "Atractivo eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar atractivo:", err);
        res.status(500).json({ error: "Error al eliminar atractivo" });
    }
});

export default router;
