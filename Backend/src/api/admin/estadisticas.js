import { db } from '../../db.js';
import express from 'express';

const router = express.Router();

// GET /api/admin/estadisticas
router.get('/', async (req, res) => {
    try {
        // Total de usuarios
        const usuarios = await db.execute({ sql: 'SELECT COUNT(*) as total FROM usuarios_locales' });
        // Total de empresas
        const empresas = await db.execute({ sql: 'SELECT COUNT(*) as total FROM empresas' });
        // Total de atractivos
        const atractivos = await db.execute({ sql: 'SELECT COUNT(*) as total FROM atractivos' });
        // Total de reseñas
        const resenias = await db.execute({ sql: 'SELECT COUNT(*) as total FROM reseñas' });
        // Total de rutas
        const rutas = await db.execute({ sql: 'SELECT COUNT(*) as total FROM rutas' });

        res.json({
            usuarios: usuarios.rows[0].total,
            empresas: empresas.rows[0].total,
            atractivos: atractivos.rows[0].total,
            reseñas: resenias.rows[0].total,
            rutas: rutas.rows[0].total
        });
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

export default router;
