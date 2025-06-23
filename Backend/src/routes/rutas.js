import express from 'express';
import { db } from '../db.js';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';

router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM rutas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

/**
 * @swagger
 * tags:
 *   name: Rutas
 *   description: Endpoints para gestionar rutas turísticas
 */

/**
 * @swagger
 * /api/rutas:
 *   get:
 *     summary: Obtiene todas las rutas turísticas
 *     tags: [Rutas]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtro por nombre de ruta
 *     responses:
 *       200:
 *         description: Lista de rutas turísticas
 */
router.get("/", async (req, res) => {
  try {
    const { nombre } = req.query;
    
    let sql = "SELECT * FROM rutas";
    let args = [];
    
    // Aplicar filtros si existen
    if (nombre) {
      sql += " WHERE nombre LIKE ?";
      args.push(`%${nombre}%`);
    }
    
    // Ordenar por ID numéricamente (extrayendo el número después de 'ruta')
    sql += " ORDER BY CAST(SUBSTR(id, 5) AS INTEGER)";
    
    const result = await db.execute({
      sql: sql,
      args: args,
    });
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    res.status(500).json({ error: "Error al obtener rutas", message: error.message });
  }
});

/**
 * @swagger
 * /api/rutas/{id}:
 *   get:
 *     summary: Obtiene una ruta turística por ID
 *     tags: [Rutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ruta
 *     responses:
 *       200:
 *         description: Detalles de la ruta
 *       404:
 *         description: Ruta no encontrada
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM rutas WHERE id = ?",
      args: [req.params.id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener ruta:", error);
    res.status(500).json({ error: "Error al obtener ruta", message: error.message });
  }
});

/**
 * @swagger
 * /api/rutas/{id}/atractivos:
 *   get:
 *     summary: Obtiene los atractivos asociados a una ruta
 *     tags: [Rutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ruta
 *     responses:
 *       200:
 *         description: Lista de atractivos en la ruta
 *       404:
 *         description: Ruta no encontrada
 */
router.get("/:id/atractivos", async (req, res) => {
  try {
    const rutasResult = await db.execute({
      sql: "SELECT * FROM rutas WHERE id = ?",
      args: [req.params.id]
    });
    
    if (rutasResult.rows.length === 0) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }
    
    const atractivosResult = await db.execute({
      sql: `
        SELECT a.*, ra.orden
        FROM atractivos a
        JOIN rutas_atractivos ra ON a.id = ra.atractivo_id
        WHERE ra.ruta_id = ?
        ORDER BY ra.orden
      `,
      args: [req.params.id]
    });
    
    res.json(atractivosResult.rows);
  } catch (error) {
    console.error("Error al obtener atractivos de la ruta:", error);
    res.status(500).json({ error: "Error al obtener atractivos de la ruta", message: error.message });
  }
});

/**
 * @swagger
 * /api/rutas:
 *   post:
 *     summary: Crea una nueva ruta turística
 *     tags: [Rutas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - creador_empresa_id
 *               - atractivos
 *     responses:
 *       201:
 *         description: Ruta creada exitosamente
 */
router.post("/", async (req, res) => {
  const { nombre, descripcion, creador_empresa_id, atractivos } = req.body;
  
  if (!nombre || !descripcion || !creador_empresa_id) {
    return res.status(400).json({ error: "Datos incompletos para crear la ruta", message: "Por favor proporciona el nombre, descripción y empresa creadora" });
  }
  
  try {
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
    
    // Obtener el número más alto utilizado para rutas
    let nextNum = 1;
    
    // Primero verificamos en la tabla de seguimiento
    const trackingResult = await db.execute({
      sql: "SELECT ultimo_numero FROM id_tracking WHERE tipo = 'ruta'"
    });
    
    if (trackingResult.rows.length > 0) {
      // Ya hay un registro de seguimiento, usamos ese número + 1
      nextNum = trackingResult.rows[0].ultimo_numero + 1;
    } else {
      // No hay registro en la tabla de seguimiento, buscamos en la tabla rutas
      const lastIdResult = await db.execute({
        sql: "SELECT id FROM rutas WHERE id LIKE 'ruta%' ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1"
      });
      
      if (lastIdResult.rows.length > 0) {
        const lastId = lastIdResult.rows[0].id;
        const lastNum = parseInt(lastId.replace('ruta', ''));
        nextNum = lastNum + 1;
      }
      
      // Insertamos un registro inicial en la tabla de seguimiento
      await db.execute({
        sql: "INSERT INTO id_tracking (tipo, ultimo_numero) VALUES (?, ?)",
        args: ['ruta', nextNum]
      });
    }
    
    // Crear ID único para la nueva ruta
    const rutaId = `ruta${nextNum}`;
    
    // Insertar la nueva ruta
    await db.execute({
      sql: `
        INSERT INTO rutas (id, nombre, descripcion, creador_empresa_id)
        VALUES (?, ?, ?, ?)
      `,
      args: [rutaId, nombre, descripcion, creador_empresa_id]
    });
    
    // Actualizamos el contador en la tabla de seguimiento
    await db.execute({
      sql: "UPDATE id_tracking SET ultimo_numero = ? WHERE tipo = ?",
      args: [nextNum, 'ruta']
    });
    
    // Insertar las relaciones con atractivos si existen
    if (atractivos && Array.isArray(atractivos) && atractivos.length > 0) {
      // En LibSQL no podemos usar INSERT múltiple como en MySQL
      // Insertamos uno por uno
      for (const atractivo of atractivos) {
        await db.execute({
          sql: `
            INSERT INTO rutas_atractivos (ruta_id, atractivo_id, orden)
            VALUES (?, ?, ?)
          `,
          args: [rutaId, atractivo.id, atractivo.orden || 1]
        });
      }
    }
      res.status(201).json({ 
      id: rutaId,
      nombre,
      descripcion,
      creador_empresa_id,
      message: "Ruta creada exitosamente"
    });
  } catch (error) {
    console.error("Error al crear ruta:", error);
    res.status(500).json({ error: "Error al crear ruta", message: error.message });
  }
});

/**
 * @swagger
 * /api/rutas/{id}:
 *   put:
 *     summary: Actualiza una ruta turística
 *     tags: [Rutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Ruta actualizada exitosamente
 *       404:
 *         description: Ruta no encontrada
 */
router.put("/:id", async (req, res) => {
  const { nombre, descripcion, creador_empresa_id, atractivos } = req.body;
  const rutaId = req.params.id;
  
  if (!nombre && !descripcion && !creador_empresa_id) {
    return res.status(400).json({ error: "Datos incompletos para actualizar la ruta" });
  }
  
  try {
    // Verificar que la ruta exista
    const rutaResult = await db.execute({
      sql: "SELECT id FROM rutas WHERE id = ?",
      args: [rutaId]
    });
    
    if (rutaResult.rows.length === 0) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }
    
    // Actualizar datos de la ruta
    let updateFields = [];
    let updateArgs = [];
    
    if (nombre) {
      updateFields.push("nombre = ?");
      updateArgs.push(nombre);
    }
    
    if (descripcion) {
      updateFields.push("descripcion = ?");
      updateArgs.push(descripcion);
    }
    
    if (creador_empresa_id) {
      updateFields.push("creador_empresa_id = ?");
      updateArgs.push(creador_empresa_id);
    }
    
    updateArgs.push(rutaId);
    
    if (updateFields.length > 0) {
      await db.execute({
        sql: `
          UPDATE rutas
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `,
        args: updateArgs
      });
    }
    
    // Actualizar relaciones con atractivos si existen
    if (atractivos && Array.isArray(atractivos) && atractivos.length > 0) {
      // Eliminar relaciones antiguas
      await db.execute({
        sql: "DELETE FROM rutas_atractivos WHERE ruta_id = ?",
        args: [rutaId]
      });
      
      // Insertar nuevas relaciones una por una (LibSQL no soporta múltiples inserciones)
      for (const atractivo of atractivos) {
        await db.execute({
          sql: `
            INSERT INTO rutas_atractivos (ruta_id, atractivo_id, orden)
            VALUES (?, ?, ?)
          `,
          args: [rutaId, atractivo.id, atractivo.orden]
        });
      }
    }
    
    res.json({ 
      id: rutaId,
      mensaje: "Ruta actualizada exitosamente" 
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al actualizar ruta:", error);
    res.status(500).json({ error: "Error al actualizar ruta", message: error.message });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /api/rutas/{id}:
 *   delete:
 *     summary: Elimina una ruta turística
 *     tags: [Rutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ruta eliminada exitosamente
 *       404:
 *         description: Ruta no encontrada
 */
router.delete("/:id", async (req, res) => {
  const rutaId = req.params.id;
  
  try {
    // Verificar que la ruta exista
    const rutaResult = await db.execute({
      sql: "SELECT id FROM rutas WHERE id = ?",
      args: [rutaId]
    });
    
    if (rutaResult.rows.length === 0) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }
    
    // Eliminar relaciones con atractivos
    await db.execute({
      sql: "DELETE FROM rutas_atractivos WHERE ruta_id = ?",
      args: [rutaId]
    });
    
    // Eliminar la ruta
    await db.execute({
      sql: "DELETE FROM rutas WHERE id = ?",
      args: [rutaId]
    });
    
    res.json({ mensaje: "Ruta eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar ruta:", error);
    res.status(500).json({ error: "Error al eliminar ruta", message: error.message });
  }
});

export default router;