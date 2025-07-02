import { db } from "../db.js";
import express from "express";
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
 * /api/atractivos/distritos:
 *   get:
 *     summary: Obtiene todas las ubicaciones únicas disponibles
 *     tags: [Atractivos]
 *     responses:
 *       200:
 *         description: Lista de ubicaciones únicas
 *       500:
 *         description: Error del servidor
 */
router.get("/distritos", async (req, res) => {
    try {
        let sql = "SELECT DISTINCT distrito FROM atractivos WHERE distrito IS NOT NULL AND distrito != ''";
        const args = [];
        sql += " ORDER BY distrito";
        const result = await db.execute({ sql, args });
        const distritos = result.rows.map(row => row.distrito).filter(d => d && d.trim() !== '');
        res.json(distritos);
    } catch (err) {
        console.error("Error al obtener distritos:", err);
        res.status(500).json({ error: "Error al obtener distritos" });
    }
});

/**
 * @swagger
 * /api/atractivos:
 *   get:
 *     summary: Obtiene todos los atractivos
 *     tags: [Atractivos]
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de empresa
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del atractivo
 *       - in: query
 *         name: distrito
 *         schema:
 *           type: string
 *         description: Filtrar por distrito
 *     responses:
 *       200:
 *         description: Lista de atractivos
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
    try {
        let sql = "SELECT * FROM atractivos WHERE 1=1";
        const args = [];

        // Filtrar por empresa_id si se proporciona
        if (req.query.empresa_id) {
            // Si empresa_id es 'null' o 'sin-empresa', filtrar por empresa_id IS NULL
            if (req.query.empresa_id === 'null' || req.query.empresa_id === 'sin-empresa') {
                sql += " AND (empresa_id IS NULL OR empresa_id = '' OR empresa_id = 'null')";
            } else {
                sql += " AND empresa_id = ?";
                args.push(req.query.empresa_id);
            }
        }

        // Filtrar por categoria_id si se proporciona
        if (req.query.categoria_id) {
            sql += " AND categoria_id = ?";
            args.push(req.query.categoria_id);
        }

        // Filtrar por nombre si se proporciona
        if (req.query.nombre) {
            sql += " AND nombre LIKE ?";
            args.push(`%${req.query.nombre}%`);
        }

        // Filtrar por distrito si se proporciona
        if (req.query.distrito) {
            sql += " AND distrito LIKE ?";
            args.push(`%${req.query.distrito}%`);
        }

        // Ordenar por fecha de creación
        sql += " ORDER BY created_at DESC";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener atractivos:", err);
        res.status(500).json({ error: "Error al obtener atractivos" });
    }
});

/**
 * @swagger
 * /api/atractivos/gestion:
 *   get:
 *     summary: Obtiene elementos para gestión (atractivos y empresas) con filtros
 *     tags: [Atractivos]
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de empresa
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del atractivo
 *     responses:
 *       200:
 *         description: Lista combinada de atractivos y empresas
 *       500:
 *         description: Error del servidor
 */
router.get("/gestion", async (req, res) => {
    try {
        const { empresa_id, categoria_id, nombre } = req.query;
        let elementos = [];

        // 1. Obtener atractivos que coincidan con los filtros
        let sqlAtractivos = "SELECT * FROM atractivos WHERE 1=1";
        const argsAtractivos = [];

        if (empresa_id) {
            if (empresa_id === 'null' || empresa_id === 'sin-empresa') {
                sqlAtractivos += " AND (empresa_id IS NULL OR empresa_id = '' OR empresa_id = 'null')";
            } else {
                sqlAtractivos += " AND empresa_id = ?";
                argsAtractivos.push(empresa_id);
            }
        }

        if (categoria_id) {
            sqlAtractivos += " AND categoria_id = ?";
            argsAtractivos.push(categoria_id);
        }

        if (nombre) {
            sqlAtractivos += " AND nombre LIKE ?";
            argsAtractivos.push(`%${nombre}%`);
        }

        sqlAtractivos += " ORDER BY created_at DESC";

        const resultAtractivos = await db.execute({
            sql: sqlAtractivos,
            args: argsAtractivos,
        });

        // Agregar atractivos a la lista
        elementos = elementos.concat(resultAtractivos.rows.map(atractivo => ({
            ...atractivo,
            tipo: 'atractivo'
        })));

        // 2. Si hay filtro de categoría, empresa o nombre, también obtener empresas que coincidan
        if (categoria_id || empresa_id || nombre) {
            let sqlEmpresas = "SELECT * FROM empresas WHERE 1=1";
            const argsEmpresas = [];

            if (categoria_id) {
                sqlEmpresas += " AND categoria_id = ?";
                argsEmpresas.push(categoria_id);
            }

            if (empresa_id && empresa_id !== 'null' && empresa_id !== 'sin-empresa') {
                sqlEmpresas += " AND id = ?";
                argsEmpresas.push(empresa_id);
            }

            // Si hay filtro de nombre, buscar también en nombres de empresas
            if (nombre) {
                sqlEmpresas += " AND nombre LIKE ?";
                argsEmpresas.push(`%${nombre}%`);
            }

            sqlEmpresas += " ORDER BY created_at DESC";

            const resultEmpresas = await db.execute({
                sql: sqlEmpresas,
                args: argsEmpresas,
            });

            // Solo agregar empresas que no tengan atractivos en la lista actual
            const empresasConAtractivos = new Set();
            elementos.forEach(elemento => {
                if (elemento.empresa_id) {
                    empresasConAtractivos.add(elemento.empresa_id);
                }
            });

            resultEmpresas.rows.forEach(empresa => {
                if (!empresasConAtractivos.has(empresa.id)) {
                    elementos.push({
                        id: null, // Sin ID de atractivo
                        nombre: "-", // Sin nombre de atractivo
                        descripcion: null,
                        direccion: empresa.direccion || "-",
                        latitud: empresa.latitud,
                        longitud: empresa.longitud,
                        img_url: empresa.img_url,
                        categoria_id: empresa.categoria_id,
                        empresa_id: empresa.id,
                        created_at: empresa.created_at,
                        tipo: 'empresa'
                    });
                }
            });
        }

        // 3. Si no hay filtros, obtener también todas las empresas sin atractivos
        if (!categoria_id && !empresa_id && !nombre) {
            // Obtener todas las empresas
            const resultTodasEmpresas = await db.execute({
                sql: "SELECT * FROM empresas ORDER BY created_at DESC",
                args: [],
            });

            // Identificar empresas que ya tienen atractivos
            const empresasConAtractivos = new Set();
            elementos.forEach(elemento => {
                if (elemento.empresa_id) {
                    empresasConAtractivos.add(elemento.empresa_id);
                }
            });

            // Agregar empresas sin atractivos
            resultTodasEmpresas.rows.forEach(empresa => {
                if (!empresasConAtractivos.has(empresa.id)) {
                    elementos.push({
                        id: null,
                        nombre: "-",
                        descripcion: null,
                        direccion: empresa.direccion || "-",
                        latitud: empresa.latitud,
                        longitud: empresa.longitud,
                        img_url: empresa.img_url,
                        categoria_id: empresa.categoria_id,
                        empresa_id: empresa.id,
                        created_at: empresa.created_at,
                        tipo: 'empresa'
                    });
                }
            });
        }

        res.json(elementos);
    } catch (err) {
        console.error("Error al obtener elementos de gestión:", err);
        res.status(500).json({ error: "Error al obtener elementos de gestión" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   get:
 *     summary: Obtiene un atractivo por su ID
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
            sql: "SELECT * FROM atractivos WHERE id = ?",
            args: [id],
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

/**
 * @swagger
 * /api/atractivos:
 *   post:
 *     summary: Crea un nuevo atractivo
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
 *               - distrito
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
 *               distrito:
 *                 type: string
 *               img_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atractivo creado exitosamente
 *       400:
 *         description: Datos inválidos
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
        distrito,
        img_url,
    } = req.body;

    if (
        !nombre ||
        !descripcion ||
        !empresa_id ||
        !categoria_id ||
        !latitud ||
        !longitud ||
        !distrito
    ) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    try {
        // Generar un UUID único para el atractivo
        const id = uuidv4();
        await db.execute({
            sql: `INSERT INTO atractivos (id, nombre, descripcion, empresa_id, categoria_id, latitud, longitud, direccion, distrito, img_url)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                distrito,
                img_url,
            ],
        });
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
 * /api/atractivos/{id}:
 *   put:
 *     summary: Actualiza un atractivo existente
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
 *               distrito:
 *                 type: string
 *               tipo:
 *                 type: string
 *               img_url:
 *                 type: string
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
        distrito,
        tipo,
        img_url,
    } = req.body;

    try {
        // Verificar si el atractivo existe
        const checkResult = await db.execute({
            sql: "SELECT * FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        // Actualizar el atractivo
        const result = await db.execute({
            sql: `UPDATE atractivos SET 
                  nombre = ?, descripcion = ?, empresa_id = ?, categoria_id = ?, 
                  latitud = ?, longitud = ?, direccion = ?, distrito = ?, tipo = ?, img_url = ?
                  WHERE id = ?`,
            args: [
                nombre,
                descripcion,
                empresa_id,
                categoria_id,
                latitud,
                longitud,
                direccion,
                distrito,
                tipo,
                img_url,
                id,
            ],
        });

        res.json({ id, mensaje: "Atractivo actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar atractivo:", err);
        res.status(500).json({ error: "Error al actualizar atractivo" });
    }
});

/**
 * @swagger
 * /api/atractivos/{id}:
 *   delete:
 *     summary: Elimina un atractivo por su ID
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
    console.log(`Solicitud de eliminación para atractivo con ID: ${id}`);

    try {
        // Verificar que el atractivo existe
        const atractivoCheck = await db.execute({
            sql: "SELECT id, nombre FROM atractivos WHERE id = ?",
            args: [id],
        });
        
        console.log(`Resultado de verificación: ${JSON.stringify(atractivoCheck)}`);
        
        if (atractivoCheck.rows.length === 0) {
            console.log(`Atractivo con ID ${id} no encontrado en la base de datos`);
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }
        
        const nombreAtractivo = atractivoCheck.rows[0].nombre;
        console.log(`Eliminando atractivo: ${nombreAtractivo} (ID: ${id})`);
        
        // Eliminar referencias en rutas_atractivos
        console.log("Eliminando referencias en rutas_atractivos...");
        await db.execute({
            sql: "DELETE FROM rutas_atractivos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar reseñas relacionadas
        console.log("Eliminando reseñas relacionadas...");
        await db.execute({
            sql: "DELETE FROM reseñas WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar favoritos relacionados
        console.log("Eliminando favoritos relacionados...");
        await db.execute({
            sql: "DELETE FROM favoritos WHERE atractivo_id = ?",
            args: [id],
        });

        // Eliminar el atractivo
        console.log("Eliminando el atractivo...");
        const result = await db.execute({
            sql: "DELETE FROM atractivos WHERE id = ?",
            args: [id],
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Atractivo no encontrado" });
        }

        console.log(`Atractivo "${nombreAtractivo}" (ID: ${id}) eliminado exitosamente`);
        res.json({ mensaje: `Atractivo "${nombreAtractivo}" eliminado exitosamente` });
    } catch (err) {
        console.error("Error al eliminar atractivo:", err);
        res.status(500).json({ 
            error: "Error al eliminar atractivo", 
            detalle: err.message || "Error desconocido"
        });
    }
});

/**
 * @swagger
 * /api/atractivos/gestion/completo:
 *   get:
 *     summary: Obtiene atractivos con información completa de empresas y categorías para gestión
 *     tags: [Atractivos]
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de empresa
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del atractivo
 *     responses:
 *       200:
 *         description: Lista de atractivos con información completa
 *       500:
 *         description: Error del servidor
 */
router.get("/gestion/completo", async (req, res) => {
    try {
        let sql = `
            SELECT 
                a.id,
                a.nombre,
                a.descripcion,
                a.empresa_id,
                a.categoria_id,
                a.latitud,
                a.longitud,
                a.direccion,
                a.distrito,
                a.img_url,
                a.created_at,
                e.nombre as empresa_nombre,
                c.nombre as categoria_nombre
            FROM atractivos a
            LEFT JOIN empresas e ON a.empresa_id = e.id
            LEFT JOIN categorias c ON a.categoria_id = c.id
            WHERE 1=1
        `;
        const args = [];

        // Filtrar por empresa_id si se proporciona
        if (req.query.empresa_id) {
            // Si empresa_id es 'null' o 'sin-empresa', filtrar por empresa_id IS NULL
            if (req.query.empresa_id === 'null' || req.query.empresa_id === 'sin-empresa') {
                sql += " AND (a.empresa_id IS NULL OR a.empresa_id = '' OR a.empresa_id = 'null')";
            } else {
                sql += " AND a.empresa_id = ?";
                args.push(req.query.empresa_id);
            }
        }

        // Filtrar por categoria_id si se proporciona
        if (req.query.categoria_id) {
            sql += " AND a.categoria_id = ?";
            args.push(req.query.categoria_id);
        }

        // Filtrar por nombre si se proporciona
        if (req.query.nombre) {
            sql += " AND a.nombre LIKE ?";
            args.push(`%${req.query.nombre}%`);
        }

        // Ordenar por fecha de creación
        sql += " ORDER BY a.created_at DESC";

        const result = await db.execute({
            sql: sql,
            args: args,
        });

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener atractivos completos:", err);
        res.status(500).json({ error: "Error al obtener atractivos completos" });
    }
});

export default router;
