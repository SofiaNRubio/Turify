import express from "express";
import { db } from "../db.js";
import { randomUUID } from "crypto";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Endpoints para gestionar categorías de atractivos
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtiene todas las categorías
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        const { nombre } = req.query;

        let sql = "SELECT * FROM categorias";
        let args = [];

        // Filtrar por nombre si se proporciona
        if (nombre) {
            sql += " WHERE nombre LIKE ?";
            args.push(`%${nombre}%`);
        }

        // Ordenar por nombre alfabéticamente
        sql += " ORDER BY nombre";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener categorías:", err);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por su ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Datos de la categoría
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM categorias WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener categoría:", err);
        res.status(500).json({ error: "Error al obtener categoría" });
    }
});

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post("/", async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
    }

    try {
        // Generar un UUID único para la categoría
        const id = randomUUID();

        await db.execute({
            sql: "INSERT INTO categorias (id, nombre) VALUES (?, ?)",
            args: [id, nombre],
        });

        res.status(201).json({ id, nombre });
    } catch (err) {
        console.error("Error al crear categoría:", err);
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría por su ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si hay atractivos que usan esta categoría
        const checkResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM atractivos WHERE categoria_id = ?",
            args: [id],
        });

        if (checkResult.rows[0].count > 0) {
            return res.status(400).json({
                error: "No se puede eliminar la categoría porque está siendo utilizada por atractivos",
            });
        }

        // Eliminar la categoría
        const result = await db.execute({
            sql: "DELETE FROM categorias WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json({ mensaje: "Categoría eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar categoría:", err);
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualiza una categoría existente
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
    }

    try {
        // Verificar si la categoría existe
        const checkResult = await db.execute({
            sql: "SELECT * FROM categorias WHERE id = ?",
            args: [id],
        });

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // Actualizar la categoría
        await db.execute({
            sql: "UPDATE categorias SET nombre = ? WHERE id = ?",
            args: [nombre, id],
        });

        res.json({ id, nombre, mensaje: "Categoría actualizada exitosamente" });
    } catch (err) {
        console.error("Error al actualizar categoría:", err);
        res.status(500).json({ error: "Error al actualizar categoría" });
    }
});

export default router;
