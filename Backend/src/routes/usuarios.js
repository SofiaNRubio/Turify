import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestionar usuarios (usando Clerk para autenticación)
 */

/**
 * @swagger
 * /api/usuarios/perfil/{user_id}:
 *   get:
 *     summary: Obtiene el perfil de un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/perfil/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;

        // Obtener estadísticas del usuario desde las tablas existentes
        const estadisticas = {
            total_resenas: 0,
            total_favoritos: 0,
            atractivos_visitados: 0,
        };

        // Contar reseñas del usuario
        const resenasResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM reseñas WHERE user_id = ?",
            args: [user_id],
        });
        estadisticas.total_resenas = resenasResult.rows[0]?.count || 0;

        // Contar favoritos del usuario
        const favoritosResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM favoritos WHERE user_id = ?",
            args: [user_id],
        });
        estadisticas.total_favoritos = favoritosResult.rows[0]?.count || 0;

        // Los atractivos visitados podrían ser los que tienen reseñas
        estadisticas.atractivos_visitados = estadisticas.total_resenas;

        res.json({
            user_id,
            estadisticas,
        });
    } catch (error) {
        console.error("Error al obtener perfil de usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * @swagger
 * /api/usuarios/{user_id}/favoritos:
 *   get:
 *     summary: Obtiene los favoritos de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de favoritos del usuario
 *       500:
 *         description: Error del servidor
 */
router.get("/:user_id/favoritos", async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await db.execute({
            sql: `
                SELECT f.*, a.nombre as atractivo_nombre, a.descripcion, a.img_url
                FROM favoritos f
                LEFT JOIN atractivos a ON f.atractivo_id = a.id
                WHERE f.user_id = ?
                ORDER BY f.fecha DESC
            `,
            args: [user_id],
        });

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener favoritos del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * @swagger
 * /api/usuarios/{user_id}/resenas:
 *   get:
 *     summary: Obtiene las reseñas de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de reseñas del usuario
 *       500:
 *         description: Error del servidor
 */
router.get("/:user_id/resenas", async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await db.execute({
            sql: `
                SELECT r.*, a.nombre as atractivo_nombre
                FROM reseñas r
                LEFT JOIN atractivos a ON r.atractivo_id = a.id
                WHERE r.user_id = ?
                ORDER BY r.fecha DESC
            `,
            args: [user_id],
        });

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener reseñas del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
