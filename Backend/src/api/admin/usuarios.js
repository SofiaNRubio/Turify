import { db } from '../../db.js';
import express from "express";

const router = express.Router();

// GET /api/admin/usuarios - Lista todos los usuarios locales
router.get("/", async (req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM usuarios_locales",
        });
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener usuarios locales:", err);
        res.status(500).json({ error: "Error al obtener usuarios locales" });
    }
});

// PUT /api/admin/usuarios/:id/rol - Actualiza el rol de un usuario local
router.put("/:id/rol", async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    if (!rol) {
        return res.status(400).json({ error: "El campo 'rol' es requerido" });
    }
    try {
        const result = await db.execute({
            sql: "UPDATE usuarios_locales SET rol = ? WHERE user_id = ?",
            args: [rol, id],
        });
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Rol actualizado correctamente" });
    } catch (err) {
        console.error("Error al actualizar rol de usuario:", err);
        res.status(500).json({ error: "Error al actualizar rol de usuario" });
    }
});

export default router;
