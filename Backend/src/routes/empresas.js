import express from "express";
import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Crear empresa
router.post("/", async (req, res) => {
    const {
        nombre,
        descripcion,
        email,
        telefono,
        sitio_web,
        direccion,
        latitud,
        longitud,
        tipo,
    } = req.body;

    const id = uuidv4();

    try {
        await db.execute({
            sql: `INSERT INTO empresas 
        (id, nombre, descripcion, email, telefono, sitio_web, direccion, latitud, longitud, tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
                latitud,
                longitud,
                tipo,
            ],
        });

        res.status(201).json({ id, nombre });
    } catch (err) {
        console.error("Error al crear empresa:", err);
        res.status(500).json({ error: "Error al crear empresa" });
    }
});

// Listar todas las empresas
router.get("/", async (_req, res) => {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM empresas",
        });
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener empresas:", err);
        res.status(500).json({ error: "Error al obtener empresas" });
    }
});

// Obtener una empresa por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener empresa:", err);
        res.status(500).json({ error: "Error al obtener empresa" });
    }
});

// Actualizar empresa por ID
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        descripcion,
        email,
        telefono,
        sitio_web,
        direccion,
        latitud,
        longitud,
        tipo,
    } = req.body;

    try {
        const result = await db.execute({
            sql: `UPDATE empresas SET 
        nombre = ?, descripcion = ?, email = ?, telefono = ?, sitio_web = ?, direccion = ?, latitud = ?, longitud = ?, tipo = ?
        WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                email,
                telefono,
                sitio_web,
                direccion,
                latitud,
                longitud,
                tipo,
                id,
            ],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json({ mensaje: "Empresa actualizada" });
    } catch (err) {
        console.error("Error al actualizar empresa:", err);
        res.status(500).json({ error: "Error al actualizar empresa" });
    }
});

// Eliminar empresa por ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.execute({
            sql: "DELETE FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json({ mensaje: "Empresa eliminada" });
    } catch (err) {
        console.error("Error al eliminar empresa:", err);
        res.status(500).json({ error: "Error al eliminar empresa" });
    }
});

export default router;
