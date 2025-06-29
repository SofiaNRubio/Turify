import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favoritos
 *   description: Endpoints para gestionar favoritos de usuarios
 */

/**
 * @swagger
 * /api/favoritos/{atractivoId}:
 *   post:
 *     summary: Agregar un atractivo a favoritos
 *     tags: [Favoritos]
 *     parameters:
 *       - in: path
 *         name: atractivoId
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
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorito agregado correctamente
 *       400:
 *         description: Error en los datos o favorito ya existe
 *       500:
 *         description: Error del servidor
 */
router.post("/:atractivoId", async (req, res) => {
    const { atractivoId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "user_id es requerido" });
    }

    try {
        // Verificar si ya existe el favorito
        const existingFavorite = await db.execute({
            sql: "SELECT * FROM favoritos WHERE user_id = ? AND atractivo_id = ?",
            args: [user_id, atractivoId],
        });

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({ error: "El favorito ya existe" });
        }

        await db.execute({
            sql: "INSERT INTO favoritos (user_id, atractivo_id) VALUES (?, ?)",
            args: [user_id, atractivoId],
        });
        res.status(201).json({ mensaje: "Favorito agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar favorito:", error);
        res.status(500).json({ error: "Error al agregar favorito" });
    }
});

/**
 * @swagger
 * /api/favoritos:
 *   get:
 *     summary: Obtener todos los favoritos o filtrar por usuario
 *     tags: [Favoritos]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filtrar favoritos por ID de usuario
 *     responses:
 *       200:
 *         description: Lista de favoritos
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        let sql =
            "SELECT f.*, a.nombre as atractivo_nombre FROM favoritos f LEFT JOIN atractivos a ON f.atractivo_id = a.id";
        const args = [];

        // Filtrar por user_id si se proporciona
        if (req.query.user_id) {
            sql += " WHERE f.user_id = ?";
            args.push(req.query.user_id);
        }

        sql += " ORDER BY f.fecha DESC";

        const result = await db.execute({
            sql: sql,
            args: args,
        });
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener favoritos:", error);
        res.status(500).json({ error: "Error al obtener favoritos" });
    }
});

/**
 * @swagger
 * /api/favoritos/{atractivoId}:
 *   delete:
 *     summary: Eliminar un favorito
 *     tags: [Favoritos]
 *     parameters:
 *       - in: path
 *         name: atractivoId
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
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorito eliminado correctamente
 *       404:
 *         description: Favorito no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:atractivoId", async (req, res) => {
    const { atractivoId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "user_id es requerido" });
    }

    try {
        const result = await db.execute({
            sql: "DELETE FROM favoritos WHERE atractivo_id = ? AND user_id = ?",
            args: [atractivoId, user_id],
        });
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Favorito no encontrado" });
        }
        res.json({ mensaje: "Favorito eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar favorito:", error);
        res.status(500).json({ error: "Error al eliminar favorito" });
    }
});

export default router;
