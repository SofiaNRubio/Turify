import express from "express";
import { db } from "../db.js";

const router = express.Router();

// POST /api/favoritos/:atractivoId - Agregar un favorito
router.post("/:atractivoId", async (req, res) => {
    const { atractivoId } = req.params;
    const { user_id, atractivo } = req.body; // Se espera que el frontend envíe user_id y atractivo en el body
    const fecha = new Date().toISOString();

    try {
        await db.execute({
            sql: "INSERT INTO favoritos (user_id, atractivo_id, fecha, atractivo) VALUES (?, ?, ?, ?)",
            args: [user_id, atractivoId, fecha, atractivo],
        });
        res.status(201).json({ mensaje: "Favorito agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar favorito:", error);
        res.status(500).json({ error: "Error al agregar favorito" });
    }
});

// GET /api/favoritos - Obtener todos los favoritos
router.get("/", async (req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM favoritos",
        });
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener favoritos:", error);
        res.status(500).json({ error: "Error al obtener favoritos" });
    }
});

// DELETE /api/favoritos/:atractivoId - Eliminar un favorito por atractivoId y user_id
router.delete("/:atractivoId", async (req, res) => {
    const { atractivoId } = req.params;
    const { user_id } = req.body; // Se espera que el frontend envíe user_id en el body

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