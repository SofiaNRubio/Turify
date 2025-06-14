import { db } from '../../../db.js';
import express from 'express';

const router = express.Router();

// GET /api/admin/reseñas - Lista todas las reseñas
router.get('/', async (req, res) => {
    try {
        const result = await db.execute({
            sql: `SELECT r.id, r.user_id, r.atractivo_id, r.comentario, r.puntaje, r.fecha, u.nombre as usuario
                  FROM reseñas r
                  LEFT JOIN usuarios_locales u ON r.user_id = u.user_id`
        });
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener reseñas:', err);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
});

// DELETE /api/admin/reseñas/:id - Elimina una reseña por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute({
            sql: 'DELETE FROM reseñas WHERE id = ?',
            args: [id]
        });
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.json({ mensaje: 'Reseña eliminada correctamente' });
    } catch (err) {
        console.error('Error al eliminar reseña:', err);
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
});

export default router;
