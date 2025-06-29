import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * GET /api/ubicaciones
 * 
 * Endpoint especializado en datos geográficos y ubicaciones.
 * Obtiene todas las ubicaciones únicas de la base de datos, tanto
 * de atractivos como de empresas.
 * 
 * Características:
 * - Opcionalmente filtra por tipo (empresa o atractivo)
 * - Soporta búsqueda parcial por texto en la dirección
 * - Devuelve datos mínimos necesarios para componentes de filtrado geográfico
 * 
 * Se utiliza principalmente con:
 * - FiltroPorUbicacion.jsx: Componente simple de filtrado por distrito/ubicación
 * - UbicacionFilter.jsx: Componente avanzado de filtrado geográfico
 * 
 * A diferencia de /api/filtros, esta ruta se especializa exclusivamente en ubicaciones
 * y está optimizada para componentes específicos de filtrado geográfico.
 */
router.get("/", async (req, res) => {
  try {
    // Prueba básica para verificar la conectividad a la base de datos
    try {
      const testResult = await db.execute("SELECT 1");
      console.log("Conexión a la base de datos exitosa:", testResult);
    } catch (dbError) {
      console.error("Error de conexión a la base de datos:", dbError);
      return res.status(500).json({ 
        error: "Error de conexión a la base de datos", 
        details: dbError.message 
      });
    }
    
    const { tipo, busqueda } = req.query;
    
    // Base query para obtener ubicaciones únicas
    let sql = `
      SELECT DISTINCT direccion, latitud, longitud, 'atractivos' as fuente 
      FROM atractivos 
      WHERE direccion IS NOT NULL
      UNION
      SELECT DISTINCT direccion, latitud, longitud, 'empresas' as fuente 
      FROM empresas 
      WHERE direccion IS NOT NULL
    `;
    
    // Si se especifica tipo, filtramos solo por ese tipo de entidad
    if (tipo === 'atractivos') {
      sql = `
        SELECT DISTINCT direccion, latitud, longitud, 'atractivos' as fuente 
        FROM atractivos 
        WHERE direccion IS NOT NULL
      `;
    } else if (tipo === 'empresas') {
      sql = `
        SELECT DISTINCT direccion, latitud, longitud, 'empresas' as fuente 
        FROM empresas 
        WHERE direccion IS NOT NULL
      `;
    }
    
    // Si se especifica texto de búsqueda, agregamos filtro LIKE
    if (busqueda) {
      // Si ya teníamos un filtro de tipo, modificamos esa consulta
      if (tipo) {
        sql = sql.replace('WHERE direccion IS NOT NULL', `WHERE direccion IS NOT NULL AND direccion LIKE '%${busqueda}%'`);
      } else {
        // Si es la consulta unificada, tenemos que agregar el filtro en ambas partes
        sql = `
          SELECT DISTINCT direccion, latitud, longitud, 'atractivos' as fuente 
          FROM atractivos 
          WHERE direccion IS NOT NULL AND direccion LIKE '%${busqueda}%'
          UNION
          SELECT DISTINCT direccion, latitud, longitud, 'empresas' as fuente 
          FROM empresas 
          WHERE direccion IS NOT NULL AND direccion LIKE '%${busqueda}%'
        `;
      }
    }
    
    // Ordenar por dirección
    sql += " ORDER BY direccion";
    
    const result = await db.execute(sql);
    
    // Normalización para evitar duplicados similares (con/sin sufijo ", San Rafael")
    const ubicacionesUnicas = {};
    
    result.rows.forEach(row => {
      // Normaliza la dirección quitando ", San Rafael" si existe
      const direccionNormalizada = row.direccion.replace(/, San Rafael$/i, '');
      
      // Si ya existe esta dirección normalizada, conservamos la más completa
      if (!ubicacionesUnicas[direccionNormalizada] ||
          row.direccion.length > ubicacionesUnicas[direccionNormalizada].direccion.length) {
        ubicacionesUnicas[direccionNormalizada] = row;
      }
    });
    
    // Convertimos el objeto a un array para la respuesta
    const ubicaciones = Object.values(ubicacionesUnicas);
    
    console.log(`Ubicaciones encontradas: ${ubicaciones.length}`);
    res.json(ubicaciones);
    
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    res.status(500).json({ error: "No se pudieron cargar las ubicaciones" });
  }
});

/**
 * GET /api/ubicaciones/cercanas
 * Encuentra ubicaciones cercanas basadas en coordenadas y radio
 */
router.get("/cercanas", async (req, res) => {
  try {
    const { lat, lng, radio = 5, tipo } = req.query; // radio en kilómetros
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Se requieren latitud y longitud" });
    }
    
    // Convertir radio de km a grados (aproximadamente)
    const radioGrados = Number(radio) / 111; // 1 grado ≈ 111 km
    
    // Calculamos distancia usando el teorema de Pitágoras simplificado
    // para distancias cortas es una aproximación suficiente
    let sql = `
      SELECT direccion, latitud, longitud, 'atractivos' as fuente,
       SQRT((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
            (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) as distancia
      FROM atractivos 
      WHERE direccion IS NOT NULL
        AND ((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
            (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) <= ${radioGrados * radioGrados}
      UNION
      SELECT direccion, latitud, longitud, 'empresas' as fuente,
       SQRT((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
            (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) as distancia
      FROM empresas 
      WHERE direccion IS NOT NULL
        AND ((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
            (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) <= ${radioGrados * radioGrados}
      ORDER BY distancia
    `;
    
    // Filtrar por tipo si es necesario
    if (tipo === 'atractivos') {
      sql = `
        SELECT direccion, latitud, longitud, 'atractivos' as fuente,
         SQRT((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
              (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) as distancia
        FROM atractivos 
        WHERE direccion IS NOT NULL
          AND ((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
              (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) <= ${radioGrados * radioGrados}
        ORDER BY distancia
      `;
    } else if (tipo === 'empresas') {
      sql = `
        SELECT direccion, latitud, longitud, 'empresas' as fuente,
         SQRT((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
              (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) as distancia
        FROM empresas 
        WHERE direccion IS NOT NULL
          AND ((latitud - ${Number(lat)})*(latitud - ${Number(lat)}) + 
              (longitud - ${Number(lng)})*(longitud - ${Number(lng)})) <= ${radioGrados * radioGrados}
        ORDER BY distancia
      `;
    }
    
    const result = await db.execute(sql);
    console.log(`Ubicaciones cercanas encontradas: ${result.rows.length}`);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error("Error al obtener ubicaciones cercanas:", error);
    res.status(500).json({ error: "No se pudieron cargar las ubicaciones cercanas" });
  }
});

export default router;
