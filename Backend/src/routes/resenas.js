import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reseñas
 *   description: Endpoints para gestionar reseñas de atractivos
 */

/**
 * @swagger
 * /api/resenas:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - atractivo_id
 *               - comentario
 *               - puntaje
 *             properties:
 *               user_id:
 *                 type: string
 *               atractivo_id:
 *                 type: string
 *               comentario:
 *                 type: string
 *               puntaje:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos o reseña ya existe
 *       500:
 *         description: Error del servidor
 */
router.post("/", async (req, res) => {
    const { user_id, atractivo_id, comentario, puntaje } = req.body;

    if (!user_id || !atractivo_id || !comentario || !puntaje) {
        return res.status(400).json({
            error: "Se requieren user_id, atractivo_id, comentario y puntaje",
        });
    }

    if (puntaje < 1 || puntaje > 5) {
        return res.status(400).json({
            error: "El puntaje debe estar entre 1 y 5",
        });
    }

    try {
        // Verificar si existe el atractivo
        const atractivoExistente = await db.execute({
            sql: "SELECT id FROM atractivos WHERE id = ?",
            args: [atractivo_id],
        });

        if (atractivoExistente.rows.length === 0) {
            return res.status(400).json({
                error: `El atractivo con ID ${atractivo_id} no existe`,
            });
        }

        // Verificar si el usuario ya ha reseñado este atractivo
        const existingReview = await db.execute({
            sql: "SELECT id FROM reseñas WHERE user_id = ? AND atractivo_id = ?",
            args: [user_id, atractivo_id],
        });

        if (existingReview.rows.length > 0) {
            return res.status(400).json({
                error: "Ya has reseñado este atractivo",
            });
        }

        // Generar ID único para la reseña
        const id = `res${Date.now()}`;

        await db.execute({
            sql: "INSERT INTO reseñas (id, user_id, atractivo_id, comentario, puntaje) VALUES (?, ?, ?, ?, ?)",
            args: [id, user_id, atractivo_id, comentario, puntaje],
        });

        res.status(201).json({
            id,
            mensaje: "Reseña creada correctamente",
        });
    } catch (err) {
        console.error("Error al crear reseña:", err);
        res.status(500).json({ error: "Error al crear la reseña" });
    }
});

/**
 * @swagger
 * /api/resenas/{atractivo_id}:
 *   get:
 *     summary: Obtener reseñas de un atractivo
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: atractivo_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
 *     responses:
 *       200:
 *         description: Lista de reseñas del atractivo
 *       500:
 *         description: Error del servidor
 */
router.get("/:atractivo_id", async (req, res) => {
    const { atractivo_id } = req.params;

    try {
        const result = await db.execute({
            sql: `
                SELECT r.id, r.atractivo_id, r.user_id, r.comentario, r.puntaje, r.fecha
                FROM reseñas r
                WHERE r.atractivo_id = ?
                ORDER BY r.fecha DESC
            `,
            args: [atractivo_id],
        });

        res.json(result.rows);
    } catch (err) {
        console.error(
            `Error al obtener reseñas para atractivo ${atractivo_id}:`,
            err
        );
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
});

/**
 * @swagger
 * /api/resenas:
 *   get:
 *     summary: Obtener todas las reseñas o filtrar por usuario
 *     tags: [Reseñas]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filtrar reseñas por ID de usuario
 *       - in: query
 *         name: atractivo_id
 *         schema:
 *           type: string
 *         description: Filtrar reseñas por ID de atractivo
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        let sql = `
            SELECT r.id, r.atractivo_id, r.user_id, r.comentario, r.puntaje, r.fecha,
                   a.nombre as atractivo_nombre
            FROM reseñas r
            LEFT JOIN atractivos a ON r.atractivo_id = a.id
            WHERE 1=1
        `;
        const args = [];

        // Filtrar por user_id si se proporciona
        if (req.query.user_id) {
            sql += " AND r.user_id = ?";
            args.push(req.query.user_id);
        }

        // Filtrar por atractivo_id si se proporciona
        if (req.query.atractivo_id) {
            sql += " AND r.atractivo_id = ?";
            args.push(req.query.atractivo_id);
        }

        sql += " ORDER BY r.fecha DESC";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener reseñas:", err);
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
});

/**
 * @swagger
 * /api/resenas/{id}:
 *   delete:
 *     summary: Eliminar una reseña
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada exitosamente
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.execute({
            sql: "DELETE FROM reseñas WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Reseña no encontrada" });
        }

        res.json({ mensaje: "Reseña eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar reseña:", err);
        res.status(500).json({ error: "Error al eliminar reseña" });
    }
});

/**
 * @swagger
 * /api/resenas/{id}:
 *   put:
 *     summary: Actualizar una reseña
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comentario:
 *                 type: string
 *               puntaje:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { comentario, puntaje } = req.body;

    if (!comentario && !puntaje) {
        return res.status(400).json({
            error: "Se requiere al menos comentario o puntaje",
        });
    }

    if (puntaje && (puntaje < 1 || puntaje > 5)) {
        return res.status(400).json({
            error: "El puntaje debe estar entre 1 y 5",
        });
    }

    try {
        // Verificar si la reseña existe
        const checkResult = await db.execute({
            sql: "SELECT * FROM reseñas WHERE id = ?",
            args: [id],
        });

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Reseña no encontrada" });
        }

        // Construir la consulta de actualización dinámicamente
        let updateFields = [];
        let updateArgs = [];

        if (comentario) {
            updateFields.push("comentario = ?");
            updateArgs.push(comentario);
        }

        if (puntaje) {
            updateFields.push("puntaje = ?");
            updateArgs.push(puntaje);
        }

        updateArgs.push(id);

        await db.execute({
            sql: `UPDATE reseñas SET ${updateFields.join(", ")} WHERE id = ?`,
            args: updateArgs,
        });

        res.json({ id, mensaje: "Reseña actualizada exitosamente" });
    } catch (err) {
        console.error("Error al actualizar reseña:", err);
        res.status(500).json({ error: "Error al actualizar reseña" });
    }
});

export default router;
