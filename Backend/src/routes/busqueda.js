import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * Endpoint principal para búsqueda y filtrado de resultados
 * 
 * Esta ruta es la más versátil y permite buscar/filtrar atractivos y empresas
 * utilizando múltiples criterios simultáneamente. A diferencia de /api/filtros,
 * que solo devuelve las opciones de filtrado, esta ruta devuelve los resultados filtrados.
 * 
 * Soporta filtrado por:
 * - tipo: Tipo de empresa (hotel, bodega, etc.)
 * - categoria: Categoría de atractivo
 * - entidad: Tipo de entidad (empresas, atractivos o ambos)
 * - ubicacion: Ubicación/distrito específico
 * - lat/lng/radio: Búsqueda por proximidad geográfica
 * 
 * Se utiliza principalmente con los componentes de filtrado como FiltroCompleto.jsx
 * y páginas de búsqueda/exploración.
 */
router.get("/", async (req, res) => {
  const { tipo, categoria, entidad, lat, lng, radio, ubicacion } = req.query;
  console.log("Parámetros de búsqueda recibidos:", { tipo, categoria, entidad, lat, lng, radio, ubicacion });
  let results = {};

  try {
    // Empresas
    if (!entidad || entidad === "empresas") {
      let sql = "SELECT * FROM empresas WHERE 1=1";
      let args = [];

      if (tipo) {
        sql += " AND tipo = ?";
        args.push(tipo);
        console.log("Filtro de tipo aplicado para empresas:", tipo);
      }

      if (ubicacion) {
        sql += " AND direccion = ?"; 
        args.push(ubicacion);
        console.log("Filtro de ubicación aplicado para empresas:", ubicacion);
      }

      if (lat && lng && radio) {
        sql += ` AND ( ( (latitud - ?) * (latitud - ?) ) + ( (longitud - ?) * (longitud - ?) ) ) <= ?`;
        const radioGrados = Number(radio) / 111;
        args.push(Number(lat), Number(lat), Number(lng), Number(lng), radioGrados * radioGrados);
      }

      const empresasResult = await db.execute({ sql, args });
      results.empresas = empresasResult.rows;
      console.log("Empresas encontradas:", results.empresas.length);
      console.log("SQL para empresas:", sql);
      console.log("Argumentos:", args);
    }

    // Atractivos
    if (!entidad || entidad === "atractivos") {
      let sql = `
        SELECT a.*, c.nombre as categoria_nombre, e.nombre as empresa_nombre 
        FROM atractivos a
        LEFT JOIN categorias c ON a.categoria_id = c.id
        LEFT JOIN empresas e ON a.empresa_id = e.id
        WHERE 1=1`;
      let args = [];

      if (categoria) {
        sql += " AND c.nombre = ?";
        args.push(categoria);
        console.log("Filtro de categoría aplicado:", categoria);
      }
      
      if (ubicacion) {
        sql += " AND a.direccion = ?";
        args.push(ubicacion);
        console.log("Filtro de ubicación aplicado para atractivos:", ubicacion);
      }

      if (lat && lng && radio) {
        sql += ` AND ( ( (a.latitud - ?) * (a.latitud - ?) ) + ( (a.longitud - ?) * (a.longitud - ?) ) ) <= ?`;
        const radioGrados = Number(radio) / 111;
        args.push(Number(lat), Number(lat), Number(lng), Number(lng), radioGrados * radioGrados);
      }

      console.log("SQL para atractivos:", sql);
      console.log("Argumentos:", args);
      results.atractivos = (await db.execute({ sql, args })).rows;
      console.log("Atractivos encontrados:", results.atractivos.length);
    }

    // Rutas
    if (!entidad || entidad === "rutas") {
      let sql = "SELECT * FROM rutas WHERE 1=1";
      let args = [];
      results.rutas = (await db.execute({ sql, args })).rows;
    }

    res.json(results);
  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

export default router;
