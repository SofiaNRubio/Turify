import express from 'express';
import { db } from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM rutas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

export default router;