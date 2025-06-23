import { db } from '../../db.js';
import express from 'express';
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();
const requireAuth = ClerkExpressRequireAuth({});

router.post('/', requireAuth, async (req, res) => {
    const { atractivo_id, comentario, puntaje } = req.body;
    const user_id = req.auth.userId;

    if (!atractivo_id || !comentario || !puntaje) {
        return res.status(400).json({ error: 'Se requieren atractivo_id, comentario y puntaje' });
    }

    if (puntaje < 1 || puntaje > 5) {
        return res.status(400).json({ error: 'El puntaje debe estar entre 1 y 5' });
    }

    try {
        // Verificar si el usuario ya ha reseñado este atractivo
        const existingReview = await db.execute({
            sql: 'SELECT id FROM reseñas WHERE user_id = ? AND atractivo_id = ?',
            args: [user_id, atractivo_id]
        });

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'Ya has reseñado este atractivo' });
        }

        const result = await db.execute({
            sql: 'INSERT INTO reseñas (user_id, atractivo_id, comentario, puntaje, fecha) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            args: [user_id, atractivo_id, comentario, puntaje]
        });

        res.status(201).json({ 
            id: result.lastInsertId,
            mensaje: 'Reseña creada correctamente' 
        });
    } catch (err) {
        console.error('Error al crear reseña:', err);
        res.status(500).json({ error: 'Error al crear la reseña' });
    }
});

router.get('/:atractivoId', async (req, res) => {
    const { atractivoId } = req.params;
    
    try {
        const result = await db.execute({
            sql: `SELECT r.id, r.user_id, r.comentario, r.puntaje, r.fecha, u.nombre as usuario
                  FROM reseñas r
                  LEFT JOIN usuarios_locales u ON r.user_id = u.user_id
                  WHERE r.atractivo_id = ?
                  ORDER BY r.fecha DESC`,
            args: [atractivoId]
        });
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener reseñas:', err);
        res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const user_id = req.auth.userId;
    
    try {
        const review = await db.execute({
            sql: 'SELECT user_id FROM reseñas WHERE id = ?',
            args: [id]
        });
        
        if (review.rows.length === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        
        if (review.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta reseña' });
        }
        
        const result = await db.execute({
            sql: 'DELETE FROM reseñas WHERE id = ?',
            args: [id]
        });
        
        res.json({ mensaje: 'Reseña eliminada correctamente' });
    } catch (err) {
        console.error('Error al eliminar reseña:', err);
        res.status(500).json({ error: 'Error al eliminar la reseña' });
    }
});

export default router;