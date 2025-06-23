import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestionar usuarios
 */

/**
 * @swagger
 * /api/usuarios/locales:
 *   get:
 *     summary: Obtiene todos los usuarios locales
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de usuario
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email de usuario
 *     responses:
 *       200:
 *         description: Lista de usuarios locales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   email:
 *                     type: string
 *                   rol:
 *                     type: string
 */
router.get("/locales", async (req, res) => {  try {
    const { nombre, email } = req.query;
    
    // Consulta ajustada a los campos reales de la tabla usuarios_locales
    let query = "SELECT user_id as id, nombre, rol, metadata FROM usuarios_locales WHERE 1=1";
    const params = [];
    
    if (nombre) {
      query += " AND nombre LIKE ?";
      params.push(`%${nombre}%`);
    }
    
    query += " ORDER BY user_id";
    
    console.log("Ejecutando consulta:", query);
    console.log("Parámetros:", params);
    
    const usuarios = await db.execute(query, params);
    console.log("Usuarios encontrados:", usuarios.rows.length);
    
    // Enviamos la respuesta una sola vez
    res.json(usuarios.rows);
  } catch (error) {
    console.error("Error al obtener usuarios locales:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {  try {
    const { id } = req.params;
    
    console.log("Intentando eliminar usuario con ID:", id);
    
    // Verificar si el usuario existe
    const usuario = await db.execute(
      "SELECT user_id FROM usuarios_locales WHERE user_id = ?",
      [id]
    );
    
    console.log("Resultado de búsqueda para eliminación:", usuario.rows);
    
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Eliminar el usuario
    await db.execute("DELETE FROM usuarios_locales WHERE user_id = ?", [id]);
    
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
