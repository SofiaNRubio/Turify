import express from "express";
import { db } from "../db.js";
import { clerkClient } from '@clerk/clerk-sdk-node';

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

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene la lista de usuarios desde Clerk
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        const users = await clerkClient.users.getUserList({
            limit: 100,
        });
        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios de Clerk:", error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario de Clerk
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario en Clerk
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await clerkClient.users.deleteUser(id);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario de Clerk:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

/**
 * @swagger
 * /api/usuarios/rol:
 *   put:
 *     summary: Actualiza el rol de un usuario en Clerk
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/rol", async (req, res) => {
    try {
        const { userId, rol } = req.body;
        
        if (!userId || !rol) {
            return res.status(400).json({ error: "UserId y rol son requeridos" });
        }
        
        // Actualizar los metadatos públicos del usuario para incluir el rol
        await clerkClient.users.updateUser(userId, {
            publicMetadata: { rol }
        });
        
        res.json({ mensaje: `Rol actualizado a ${rol} correctamente` });
    } catch (error) {
        console.error("Error al actualizar rol de usuario en Clerk:", error);
        res.status(500).json({ error: "Error al actualizar rol de usuario" });
    }
});

/**
 * @swagger
 * /api/usuarios/locales:
 *   get:
 *     summary: Obtiene la lista de usuarios locales (para compatibilidad)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios locales
 *       500:
 *         description: Error del servidor
 */
router.get("/locales", async (req, res) => {
    try {
        // Obtener usuarios locales de la base de datos (si existe una tabla)
        // Para compatibilidad con el sistema anterior
        try {
            const result = await db.execute({
                sql: "SELECT * FROM usuarios_locales"
            });
            res.json(result.rows);
        } catch (dbError) {
            // Si la tabla no existe, devolvemos una lista vacía
            console.log("La tabla usuarios_locales no existe o está vacía");
            res.json([]);
        }
    } catch (error) {
        console.error("Error al obtener usuarios locales:", error);
        res.status(500).json({ error: "Error al obtener usuarios locales" });
    }
});

export default router;
