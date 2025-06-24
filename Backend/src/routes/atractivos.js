import { db } from "../db.js";
import express from "express";

const router = express.Router();

// Obtener todos los atractivos
router.get("/", async (req, res) => {
    try {
        let sql = "SELECT * FROM atractivos";
        const args = [];
        
        // Filtrar por empresa_id si se proporciona
        if (req.query.empresa_id) {
            sql += " WHERE empresa_id = ?";
            args.push(req.query.empresa_id);
        }
        
        const result = await db.execute({
            sql: sql,
            args: args
        });
        
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener atractivos:", err);
        res.status(500).json({ error: "Error al obtener atractivos" });
    }
});

// Obtener un atractivo por su ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.execute({
            sql: "SELECT * FROM atractivos WHERE id = ?",
            args: [id]
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

export default router;
