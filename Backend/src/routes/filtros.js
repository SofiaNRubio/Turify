import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * Endpoint para obtener todos los filtros disponibles para atractivos y empresas
 * 
 * Esta ruta centraliza todos los criterios de filtrado en una sola llamada:
 * - Categorías de atractivos
 * - Ubicaciones normalizadas de atractivos y empresas
 * - Tipos de empresas
 * - Nombres de empresas con atractivos asociados
 * 
 * Se utiliza principalmente para inicializar el componente FiltroCompleto.jsx y
 * otros componentes que necesiten múltiples criterios de filtrado.
 * 
 * A diferencia de /api/ubicaciones, que solo devuelve datos geográficos,
 * esta ruta proporciona un conjunto completo de opciones de filtrado.
 */
router.get("/", async (req, res) => {
  try {
    // Obtenemos categorías de atractivos
    const categorias = await db.execute("SELECT DISTINCT nombre FROM categorias");
    console.log("Categorías cargadas:", categorias.rows);
    
    // Obtenemos ubicaciones normalizadas para evitar duplicados como "Calle 123" y "Calle 123, San Rafael"
    const ubicaciones = await db.execute(`
      SELECT DISTINCT 
        CASE 
          WHEN direccion LIKE '%, San Rafael' THEN REPLACE(direccion, ', San Rafael', '')
          ELSE direccion 
        END as direccion_normalizada,
        direccion as direccion_original
      FROM (
        SELECT direccion FROM atractivos WHERE direccion IS NOT NULL
        UNION
        SELECT direccion FROM empresas WHERE direccion IS NOT NULL
      ) as ubicaciones_combinadas
      ORDER BY direccion_normalizada
    `);
    
    // Agrupamos direcciones similares para mostrar la más completa
    const ubicacionesAgrupadas = {};
    ubicaciones.rows.forEach(row => {
      const base = row.direccion_normalizada;
      const original = row.direccion_original;
      
      // Si esta dirección base no existe en nuestro objeto o la actual es más larga (más detallada)
      if (!ubicacionesAgrupadas[base] || original.length > ubicacionesAgrupadas[base].length) {
        ubicacionesAgrupadas[base] = original;
      }
    });
    
    // Convertimos el objeto a un array para la respuesta
    const ubicacionesFinales = Object.values(ubicacionesAgrupadas);
    console.log("Ubicaciones normalizadas:", ubicacionesFinales);

    // Para empresas, obtenemos los tipos distintos
    const tiposEmpresa = await db.execute("SELECT DISTINCT tipo FROM empresas WHERE tipo IS NOT NULL");
    console.log("Tipos de empresa cargados:", tiposEmpresa.rows);

    const empresas = await db.execute("SELECT DISTINCT nombre FROM empresas WHERE id IN (SELECT empresa_id FROM atractivos)");
    console.log("Empresas cargadas:", empresas.rows);

    res.json({
      categorias: categorias.rows.map(row => row.nombre),
      ubicaciones: ubicacionesFinales,
      empresas: tiposEmpresa.rows.map(row => row.tipo), // Tipos de empresas
      nombresEmpresas: empresas.rows.map(row => row.nombre), // Nombres de empresas
    });
  } catch (error) {
    console.error("Error al obtener filtros:", error);
    res.status(500).json({ error: "No se pudieron cargar los filtros" });
  }
});

export default router;
