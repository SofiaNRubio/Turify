import { db } from "../../db.js";
import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();
const requireAuth = ClerkExpressRequireAuth({});

// POST /api/resenas - Crear una nueva reseña
router.post("/", requireAuth, async (req, res) => {
    const { atractivo_id, comentario, puntaje } = req.body;
    const user_id = req.auth.userId;

    console.log("-------------------------------------");
    console.log("Recibida petición de reseña:");
    console.log("- ID de atractivo recibido:", atractivo_id);
    console.log("- ID de usuario:", user_id);
    console.log("- Puntaje:", puntaje);
    console.log("- Comentario:", comentario?.substring(0, 30) + (comentario?.length > 30 ? "..." : ""));
    console.log("-------------------------------------");

    if (!atractivo_id || !comentario || !puntaje) {
        console.log("Error: Faltan datos obligatorios");
        return res
            .status(400)
            .json({ error: "Se requieren atractivo_id, comentario y puntaje" });
    }

    if (puntaje < 1 || puntaje > 5) {
        return res
            .status(400)
            .json({ error: "El puntaje debe estar entre 1 y 5" });
    }

    try {
        // Validar formato de ID
        if (!atractivo_id.startsWith('atr')) {
            console.error(`ERROR: El ID ${atractivo_id} no tiene el formato correcto para un atractivo (debe empezar con 'atr')`);
            return res
                .status(400)
                .json({ error: `El ID ${atractivo_id} no tiene el formato correcto para un atractivo` });
        }

        // Verificar si existe el atractivo en la base de datos
        const atractivoExistente = await db.execute({
            sql: "SELECT id FROM atractivos WHERE id = ?",
            args: [atractivo_id],
        });

        if (atractivoExistente.rows.length === 0) {
            console.log(`Error: No existe atractivo con ID ${atractivo_id} en la tabla de atractivos`);
            
            // Listar los primeros 5 atractivos para depuración
            const atractivos = await db.execute({
                sql: "SELECT id FROM atractivos LIMIT 5"
            });
            
            console.log("Algunos IDs de atractivos en la base de datos:", atractivos.rows.map(row => row.id));
            
            return res
                .status(400)
                .json({ error: `El atractivo con ID ${atractivo_id} no existe en la base de datos` });
        }

        // Verificar si el usuario ya ha reseñado este atractivo
        const existingReview = await db.execute({
            sql: "SELECT id FROM reseñas WHERE user_id = ? AND atractivo_id = ?",
            args: [user_id, atractivo_id],
        });

        if (existingReview.rows.length > 0) {
            return res
                .status(400)
                .json({ error: "Ya has reseñado este atractivo" });
        }

        console.log(`Insertando reseña con atractivo_id=${atractivo_id}, user_id=${user_id}`);
        
        const result = await db.execute({
            sql: "INSERT INTO reseñas (user_id, atractivo_id, comentario, puntaje, fecha) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
            args: [user_id, atractivo_id, comentario, puntaje],
        });

        res.status(201).json({
            id: result.lastInsertId,
            mensaje: "Reseña creada correctamente",
        });
    } catch (err) {
        console.error("Error al crear reseña:", err);
        res.status(500).json({ error: `Error al crear la reseña: ${err.message}` });
    }
});

// GET /api/resenas/:atractivo_id - Obtener reseñas de un atractivo
router.get("/:atractivo_id", async (req, res) => {
    const { atractivo_id } = req.params;

    try {
        console.log("-------------------------------------");
        console.log(`Buscando reseñas para atractivo: ${atractivo_id}`);
        
        // Consulta modificada sin el JOIN a la tabla usuarios
        const result = await db.execute({
            sql: `
                SELECT r.id, r.atractivo_id, r.user_id, r.comentario, r.puntaje, r.fecha,
                       'Usuario' as usuario  -- Valor predeterminado para todos los usuarios
                FROM reseñas r
                WHERE r.atractivo_id = ?
                ORDER BY r.fecha DESC
            `,
            args: [atractivo_id],
        });

        console.log(`Se encontraron ${result.rows.length} reseñas para el atractivo ${atractivo_id}`);
        console.log("-------------------------------------");
        res.json(result.rows);
    } catch (err) {
        console.error(`Error al obtener reseñas para atractivo ${atractivo_id}:`, err);
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
});

export default router;
