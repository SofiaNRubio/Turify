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
/**
 * @swagger
 * /empresas:
 *   get:
 *     summary: Obtiene la lista de todas las empresas
 *     tags: [Empresas]
 *     responses:
 *       '200':
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /empresas/{id}:
 *   get:
 *     summary: Obtiene una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa
 *     responses:
 *       '200':
 *         description: Datos de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '404':
 *         description: Empresa no encontrada
 */

/**
 * @swagger
 * /empresas/{id}:
 *   put:
 *     summary: Actualiza una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               sitio_web:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               tipo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Empresa actualizada
 *       '404':
 *         description: Empresa no encontrada
 *       '500':
 *         description: Error al actualizar empresa
 */

/**
 * @swagger
 * /empresas/{id}:
 *   delete:
 *     summary: Elimina una empresa por su ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa a eliminar
 *     responses:
 *       '200':
 *         description: Empresa eliminada
 *       '404':
 *         description: Empresa no encontrada
 *       '500':
 *         description: Error al eliminar empresa
 */

export default router;
