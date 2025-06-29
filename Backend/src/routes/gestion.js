import express from "express";
import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Atractivos
 *   description: Endpoints para gestionar atractivos turísticos
 */

/**
 * @swagger
 * /api/atractivos:
 *   post:
 *     summary: Crea un nuevo atractivo turístico
 *     tags: [Atractivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - empresa_id
 *               - categoria_id
 *               - latitud
 *               - longitud
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               empresa_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               direccion:
 *                 type: string
 *               img_url:
 *                 type: string
 *                 description: URL de la imagen del atractivo
 *     responses:
 *       201:
 *         description: Atractivo creado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post("/", async (req, res) => {
    const {
        nombre,
        descripcion,
        empresa_id,
        categoria_id,
        latitud,
        longitud,
        direccion,
        img_url, // Cambiado de tipo a img_url según el esquema
    } = req.body;
    try {
        // Generar un UUID único para el atractivo
        const id = uuidv4();

        // Verificar si la empresa existe
        if (empresa_id) {
            const empresaResult = await db.execute({
                sql: "SELECT id FROM empresas WHERE id = ?",
                args: [empresa_id],
            });

            if (empresaResult.rows.length === 0) {
                return res
                    .status(400)
                    .json({ error: "La empresa especificada no existe" });
            }
        }

        // Verificar si la categoría existe
        if (categoria_id) {
            const categoriaResult = await db.execute({
                sql: "SELECT id FROM categorias WHERE id = ?",
                args: [categoria_id],
            });

            if (categoriaResult.rows.length === 0) {
                return res
                    .status(400)
                    .json({ error: "La categoría especificada no existe" });
            }
        } // Insertar el atractivo
        await db.execute({
            sql: `INSERT INTO atractivos 
            (id, nombre, descripcion, empresa_id, categoria_id, latitud, longitud, direccion, img_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                img_url,
            ],
        });
        // Retornar los datos del atractivo creado
        res.status(201).json({
            id,
            nombre,
            mensaje: "Atractivo creado exitosamente",
        });
    } catch (err) {
        console.error("Error al crear atractivo:", err);
        res.status(500).json({ error: "Error al crear atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos:
 *   get:
 *     summary: Obtiene todos los atractivos turísticos con filtros opcionales
 *     tags: [Atractivos]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtro por nombre
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: Filtro por ID de empresa
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtro por ID de categoría
 *     responses:
 *       200:
 *         description: Lista de atractivos
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        const { nombre, empresa_id, categoria_id } = req.query;

        let sql =
            "SELECT a.*, e.nombre as empresa_nombre, c.nombre as categoria_nombre FROM atractivos a LEFT JOIN empresas e ON a.empresa_id = e.id LEFT JOIN categorias c ON a.categoria_id = c.id";
        const whereConditions = [];
        const args = [];

        if (nombre) {
            whereConditions.push("a.nombre LIKE ?");
            args.push(`%${nombre}%`);
        }

        if (empresa_id) {
            whereConditions.push("a.empresa_id = ?");
            args.push(empresa_id);
        }

        if (categoria_id) {
            whereConditions.push("a.categoria_id = ?");
            args.push(categoria_id);
        }

        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }

        const result = await db.execute({
            sql,
            args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener atractivos:", err);
        res.status(500).json({ error: "Error al obtener atractivos" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   get:
 *     summary: Obtiene un atractivo turístico por su ID
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
 *     responses:
 *       200:
 *         description: Datos del atractivo
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.execute({
            sql: `SELECT a.*, e.nombre as empresa_nombre, c.nombre as categoria_nombre 
                  FROM atractivos a 
                  LEFT JOIN empresas e ON a.empresa_id = e.id 
                  LEFT JOIN categorias c ON a.categoria_id = c.id 
                  WHERE a.id = ?`,
            args: [id],
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        // También obtener las imágenes relacionadas con este atractivo
        const imagenesResult = await db.execute({
            sql: "SELECT * FROM imagenes WHERE entidad_tipo = 'atractivo' AND entidad_id = ? ORDER BY posicion",
            args: [id],
        });

        const atractivo = result.rows[0];
        atractivo.imagenes = imagenesResult.rows;

        res.json(atractivo);
    } catch (err) {
        console.error("Error al obtener atractivo:", err);
        res.status(500).json({ error: "Error al obtener atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   put:
 *     summary: Actualiza un atractivo turístico
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
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
 *               empresa_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               direccion:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 description: Tipo de atractivo (actividades, bodegas, naturaleza, social, etc.)
 *     responses:
 *       200:
 *         description: Atractivo actualizado exitosamente
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        descripcion,
        empresa_id,
        categoria_id,
        latitud,
        longitud,
        direccion,
        tipo, // Añadido el campo tipo
    } = req.body;

    try {
        const result = await db.execute({
            sql: `UPDATE atractivos SET 
                nombre = ?, 
                descripcion = ?, 
                empresa_id = ?, 
                categoria_id = ?, 
                latitud = ?, 
                longitud = ?, 
                direccion = ?,
                tipo = ?
                WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                req.body.tipo || "otros", // Mantener el tipo al actualizar
                id,
            ],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        res.json({ mensaje: "Atractivo actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar atractivo:", err);
        res.status(500).json({ error: "Error al actualizar atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   delete:
 *     summary: Elimina un atractivo turístico
 *     tags: [Atractivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del atractivo
 *     responses:
 *       200:
 *         description: Atractivo eliminado exitosamente
 *       404:
 *         description: Atractivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Primero eliminar referencias en rutas_atractivos
        await db.execute({
            sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar reseñas relacionadas
        await db.execute({
            sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar favoritos relacionados
        await db.execute({
            sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar imágenes relacionadas
        await db.execute({
            sql: "DELETE FROM imagenes WHERE entidad_tipo = 'atractivo' AND entidad_id = ?",
            args: [id],
        });

        // Finalmente eliminar el atractivo
        const result = await db.execute({
            sql: "DELETE FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        res.json({ mensaje: "Atractivo eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar atractivo:", err);
        res.status(500).json({ error: "Error al eliminar atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/validar:
 *   post:
 *     summary: Valida los datos de un atractivo turístico antes de crearlo
 *     tags: [Atractivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - empresa_id
 *               - categoria_id
 *               - latitud
 *               - longitud
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               empresa_id:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos válidos
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/validar", async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            empresa_id,
            categoria_id,
            latitud,
            longitud,
            direccion,
        } = req.body;

        // Validaciones básicas
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!descripcion || descripcion.trim() === "") {
            return res
                .status(400)
                .json({ error: "La descripción es obligatoria" });
        }

        if (!empresa_id) {
            return res.status(400).json({ error: "La empresa es obligatoria" });
        }

        if (!categoria_id) {
            return res
                .status(400)
                .json({ error: "La categoría es obligatoria" });
        }

        if (latitud === undefined || latitud === null || isNaN(latitud)) {
            return res
                .status(400)
                .json({ error: "La latitud debe ser un número válido" });
        }

        if (longitud === undefined || longitud === null || isNaN(longitud)) {
            return res
                .status(400)
                .json({ error: "La longitud debe ser un número válido" });
        }

        if (!direccion || direccion.trim() === "") {
            return res
                .status(400)
                .json({ error: "La dirección es obligatoria" });
        }

        // Verificar si la empresa existe
        const empresaResult = await db.execute({
            sql: "SELECT id FROM empresas WHERE id = ?",
            args: [empresa_id],
        });

        if (empresaResult.rows.length === 0) {
            return res
                .status(400)
                .json({ error: "La empresa especificada no existe" });
        }

        // Verificar si la categoría existe
        const categoriaResult = await db.execute({
            sql: "SELECT id FROM categorias WHERE id = ?",
            args: [categoria_id],
        });

        if (categoriaResult.rows.length === 0) {
            return res
                .status(400)
                .json({ error: "La categoría especificada no existe" });
        }

        // Si todo está bien, devolver éxito
        res.status(200).json({ mensaje: "Datos válidos" });
    } catch (err) {
        console.error("Error en la validación de datos:", err);
        res.status(500).json({ error: "Error al validar los datos" });
    }
});

export default router;
