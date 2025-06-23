import express from "express";
import { db } from "../db.js";

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
    } = req.body;    try {
        // Primero, intentamos crear una tabla de seguimiento de IDs si no existe
        try {
            await db.execute({
                sql: `CREATE TABLE IF NOT EXISTS id_tracking (
                    tipo TEXT NOT NULL,
                    ultimo_numero INTEGER NOT NULL,
                    PRIMARY KEY (tipo)
                )`
            });
        } catch (createErr) {
            console.error("Error al crear tabla de seguimiento:", createErr);
            // Continuamos con la ejecución aunque haya fallado la creación
        }
        
        // Obtener el número más alto utilizado para empresas
        let nextNum = 1;
        
        // Primero verificamos en la tabla de seguimiento
        const trackingResult = await db.execute({
            sql: "SELECT ultimo_numero FROM id_tracking WHERE tipo = 'empresa'"
        });
        
        if (trackingResult.rows.length > 0) {
            // Ya hay un registro de seguimiento, usamos ese número + 1
            nextNum = trackingResult.rows[0].ultimo_numero + 1;
        } else {
            // No hay registro en la tabla de seguimiento, buscamos en la tabla empresas
            const lastIdResult = await db.execute({
                sql: "SELECT id FROM empresas WHERE id LIKE 'emp%' ORDER BY CAST(SUBSTR(id, 4) AS INTEGER) DESC LIMIT 1"
            });
            
            if (lastIdResult.rows.length > 0) {
                const lastId = lastIdResult.rows[0].id;
                const lastNum = parseInt(lastId.replace('emp', ''));
                nextNum = lastNum + 1;
            }
            
            // Insertamos un registro inicial en la tabla de seguimiento
            await db.execute({
                sql: "INSERT INTO id_tracking (tipo, ultimo_numero) VALUES (?, ?)",
                args: ['empresa', nextNum]
            });
        }
        
        const id = `emp${nextNum}`;
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
        
        // Actualizamos el contador en la tabla de seguimiento
        await db.execute({
            sql: "UPDATE id_tracking SET ultimo_numero = ? WHERE tipo = ?",
            args: [nextNum, 'empresa']
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
        // Identificar primero los atractivos relacionados con esta empresa
        const atractivos = await db.execute({
            sql: "SELECT id FROM atractivos WHERE empresa_id = ?",
            args: [id],
        });
        
        // Para cada atractivo, eliminar registros relacionados
        for (const atractivo of atractivos.rows) {
            const atractivoId = atractivo.id;
            
            // Eliminar referencias en rutas_atractivos
            await db.execute({
                sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
                args: [atractivoId],
            });
            
            // Eliminar reseñas relacionadas
            await db.execute({
                sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
                args: [atractivoId],
            });
            
            // Eliminar favoritos relacionados
            await db.execute({
                sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
                args: [atractivoId],
            });
            
            // Eliminar imágenes relacionadas con el atractivo
            await db.execute({
                sql: "DELETE FROM imagenes WHERE entidad_tipo = 'atractivo' AND entidad_id = ?",
                args: [atractivoId],
            });
            
            // Finalmente eliminar el atractivo
            await db.execute({
                sql: "DELETE FROM atractivos WHERE id = ?",
                args: [atractivoId],
            });
        }
        
        // Eliminar imágenes relacionadas con la empresa
        await db.execute({
            sql: "DELETE FROM imagenes WHERE entidad_tipo = 'empresa' AND entidad_id = ?",
            args: [id],
        });
        
        // Finalmente, eliminar la empresa
        const result = await db.execute({
            sql: "DELETE FROM empresas WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json({ mensaje: "Empresa y sus atractivos eliminados exitosamente" });
    } catch (err) {
        console.error("Error al eliminar empresa:", err);
        res.status(500).json({ error: "Error al eliminar empresa" });
    }
});
/**
 * @swagger
 * /empresas:
 *   post:
 *     summary: Crea una nueva empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - email
 *               - telefono
 *               - sitio_web
 *               - direccion
 *               - latitud
 *               - longitud
 *               - tipo
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
 *       '201':
 *         description: Empresa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *       '500':
 *         description: Error al crear empresa
 */

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
