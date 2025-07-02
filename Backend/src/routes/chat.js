// chat.js - Rutas del chat
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Función para obtener información de empresas
async function obtenerInformacionEmpresas() {
    try {
        const result = await db.execute({
            sql: `SELECT e.*, c.nombre as categoria_nombre 
                  FROM empresas e 
                  LEFT JOIN categorias c ON e.categoria_id = c.id 
                  ORDER BY e.nombre`,
            args: [],
        });

        return result.rows.map((empresa) => ({
            id: empresa.id,
            nombre: empresa.nombre,
            descripcion: empresa.descripcion,
            email: empresa.email,
            telefono: empresa.telefono,
            sitio_web: empresa.sitio_web,
            direccion: empresa.direccion,
            distrito: empresa.distrito,
            categoria: empresa.categoria_nombre || "Sin categoría",
            latitud: empresa.latitud,
            longitud: empresa.longitud,
        }));
    } catch (error) {
        console.error("Error al obtener información de empresas:", error);
        return [];
    }
}

// Función para obtener empresas por categoría específica
async function obtenerEmpresasPorCategoria(categoriaId) {
    try {
        const result = await db.execute({
            sql: `SELECT e.*, c.nombre as categoria_nombre 
                  FROM empresas e 
                  LEFT JOIN categorias c ON e.categoria_id = c.id 
                  WHERE e.categoria_id = ?
                  ORDER BY e.nombre`,
            args: [categoriaId],
        });

        return result.rows.map((empresa) => ({
            id: empresa.id,
            nombre: empresa.nombre,
            descripcion: empresa.descripcion,
            email: empresa.email,
            telefono: empresa.telefono,
            sitio_web: empresa.sitio_web,
            direccion: empresa.direccion,
            distrito: empresa.distrito,
            categoria: empresa.categoria_nombre || "Sin categoría",
            latitud: empresa.latitud,
            longitud: empresa.longitud,
        }));
    } catch (error) {
        console.error("Error al obtener empresas por categoría:", error);
        return [];
    }
}

// Función para obtener empresas por distrito
async function obtenerEmpresasPorDistrito(distrito) {
    try {
        const result = await db.execute({
            sql: `SELECT e.*, c.nombre as categoria_nombre 
                  FROM empresas e 
                  LEFT JOIN categorias c ON e.categoria_id = c.id 
                  WHERE e.distrito LIKE ?
                  ORDER BY e.nombre`,
            args: [`%${distrito}%`],
        });

        return result.rows.map((empresa) => ({
            id: empresa.id,
            nombre: empresa.nombre,
            descripcion: empresa.descripcion,
            email: empresa.email,
            telefono: empresa.telefono,
            sitio_web: empresa.sitio_web,
            direccion: empresa.direccion,
            distrito: empresa.distrito,
            categoria: empresa.categoria_nombre || "Sin categoría",
            latitud: empresa.latitud,
            longitud: empresa.longitud,
        }));
    } catch (error) {
        console.error("Error al obtener empresas por distrito:", error);
        return [];
    }
}

// Función para obtener información de atractivos
async function obtenerInformacionAtractivos() {
    try {
        const result = await db.execute({
            sql: `SELECT a.*, e.nombre as empresa_nombre, c.nombre as categoria_nombre 
                  FROM atractivos a 
                  LEFT JOIN empresas e ON a.empresa_id = e.id 
                  LEFT JOIN categorias c ON a.categoria_id = c.id 
                  ORDER BY a.nombre`,
            args: [],
        });

        return result.rows.map((atractivo) => ({
            id: atractivo.id,
            nombre: atractivo.nombre,
            descripcion: atractivo.descripcion,
            direccion: atractivo.direccion,
            distrito: atractivo.distrito,
            latitud: atractivo.latitud,
            longitud: atractivo.longitud,
            precio: atractivo.precio,
            horarios: atractivo.horarios,
            telefono: atractivo.telefono,
            email: atractivo.email,
            sitio_web: atractivo.sitio_web,
            categoria: atractivo.categoria_nombre || "Sin categoría",
            empresa_id: atractivo.empresa_id,
            empresa_nombre: atractivo.empresa_nombre || "Sin empresa asociada",
            img_url: atractivo.img_url,
        }));
    } catch (error) {
        console.error("Error al obtener información de atractivos:", error);
        return [];
    }
}

// Función para obtener atractivos por empresa específica
async function obtenerAtractivosPorEmpresa(empresaId) {
    try {
        const result = await db.execute({
            sql: `SELECT a.*, e.nombre as empresa_nombre, c.nombre as categoria_nombre 
                  FROM atractivos a 
                  LEFT JOIN empresas e ON a.empresa_id = e.id 
                  LEFT JOIN categorias c ON a.categoria_id = c.id 
                  WHERE a.empresa_id = ?
                  ORDER BY a.nombre`,
            args: [empresaId],
        });

        return result.rows.map((atractivo) => ({
            id: atractivo.id,
            nombre: atractivo.nombre,
            descripcion: atractivo.descripcion,
            direccion: atractivo.direccion,
            distrito: atractivo.distrito,
            latitud: atractivo.latitud,
            longitud: atractivo.longitud,
            precio: atractivo.precio,
            horarios: atractivo.horarios,
            telefono: atractivo.telefono,
            email: atractivo.email,
            sitio_web: atractivo.sitio_web,
            categoria: atractivo.categoria_nombre || "Sin categoría",
            empresa_id: atractivo.empresa_id,
            empresa_nombre: atractivo.empresa_nombre || "Sin empresa asociada",
            img_url: atractivo.img_url,
        }));
    } catch (error) {
        console.error("Error al obtener atractivos por empresa:", error);
        return [];
    }
}

// Función para obtener atractivos por distrito
async function obtenerAtractivosPorDistrito(distrito) {
    try {
        const result = await db.execute({
            sql: `SELECT a.*, e.nombre as empresa_nombre, c.nombre as categoria_nombre 
                  FROM atractivos a 
                  LEFT JOIN empresas e ON a.empresa_id = e.id 
                  LEFT JOIN categorias c ON a.categoria_id = c.id 
                  WHERE a.distrito LIKE ?
                  ORDER BY a.nombre`,
            args: [`%${distrito}%`],
        });

        return result.rows.map((atractivo) => ({
            id: atractivo.id,
            nombre: atractivo.nombre,
            descripcion: atractivo.descripcion,
            direccion: atractivo.direccion,
            distrito: atractivo.distrito,
            latitud: atractivo.latitud,
            longitud: atractivo.longitud,
            precio: atractivo.precio,
            horarios: atractivo.horarios,
            telefono: atractivo.telefono,
            email: atractivo.email,
            sitio_web: atractivo.sitio_web,
            categoria: atractivo.categoria_nombre || "Sin categoría",
            empresa_id: atractivo.empresa_id,
            empresa_nombre: atractivo.empresa_nombre || "Sin empresa asociada",
            img_url: atractivo.img_url,
        }));
    } catch (error) {
        console.error("Error al obtener atractivos por distrito:", error);
        return [];
    }
}

// Función para generar contexto de empresas
function generarContextoEmpresas(empresas) {
    if (!empresas || empresas.length === 0) {
        return "\n\nNo hay información de empresas disponible en este momento.";
    }

    let contexto =
        "\n\n=== INFORMACIÓN DE EMPRESAS TURÍSTICAS EN SAN RAFAEL ===\n";

    // Agrupar por categorías
    const empresasPorCategoria = empresas.reduce((acc, empresa) => {
        const categoria = empresa.categoria;
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(empresa);
        return acc;
    }, {});

    Object.entries(empresasPorCategoria).forEach(
        ([categoria, empresasCategoria]) => {
            contexto += `\n**${categoria.toUpperCase()}:**\n`;

            empresasCategoria.forEach((empresa) => {
                contexto += `\n• **${empresa.nombre}**\n`;
                contexto += `  - Descripción: ${empresa.descripcion}\n`;
                if (empresa.direccion)
                    contexto += `  - Dirección: ${empresa.direccion}\n`;
                if (empresa.distrito)
                    contexto += `  - Distrito: ${empresa.distrito}\n`;
                if (empresa.telefono)
                    contexto += `  - Teléfono: ${empresa.telefono}\n`;
                if (empresa.email) contexto += `  - Email: ${empresa.email}\n`;
                if (empresa.sitio_web)
                    contexto += `  - Sitio web: ${empresa.sitio_web}\n`;
            });
        }
    );

    contexto += "\n=== FIN DE INFORMACIÓN DE EMPRESAS ===\n";
    return contexto;
}

// Función para generar contexto de atractivos
function generarContextoAtractivos(atractivos) {
    if (!atractivos || atractivos.length === 0) {
        return "\n\nNo hay información de atractivos disponible en este momento.";
    }

    let contexto =
        "\n\n=== INFORMACIÓN DE ATRACTIVOS TURÍSTICOS EN SAN RAFAEL ===\n";

    // Agrupar por categorías
    const atractivosPorCategoria = atractivos.reduce((acc, atractivo) => {
        const categoria = atractivo.categoria;
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(atractivo);
        return acc;
    }, {});

    Object.entries(atractivosPorCategoria).forEach(
        ([categoria, atractivosCategoria]) => {
            contexto += `\n**${categoria.toUpperCase()}:**\n`;

            atractivosCategoria.forEach((atractivo) => {
                contexto += `\n• **${atractivo.nombre}**\n`;
                contexto += `  - Descripción: ${atractivo.descripcion}\n`;
                if (
                    atractivo.empresa_nombre &&
                    atractivo.empresa_nombre !== "Sin empresa asociada"
                ) {
                    contexto += `  - Empresa: ${atractivo.empresa_nombre}\n`;
                }
                if (atractivo.direccion)
                    contexto += `  - Dirección: ${atractivo.direccion}\n`;
                if (atractivo.distrito)
                    contexto += `  - Distrito: ${atractivo.distrito}\n`;
                if (atractivo.precio)
                    contexto += `  - Precio: ${atractivo.precio}\n`;
                if (atractivo.horarios)
                    contexto += `  - Horarios: ${atractivo.horarios}\n`;
                if (atractivo.telefono)
                    contexto += `  - Teléfono: ${atractivo.telefono}\n`;
                if (atractivo.email)
                    contexto += `  - Email: ${atractivo.email}\n`;
                if (atractivo.sitio_web)
                    contexto += `  - Sitio web: ${atractivo.sitio_web}\n`;
            });
        }
    );

    contexto += "\n=== FIN DE INFORMACIÓN DE ATRACTIVOS ===\n";
    return contexto;
}

// Función para generar contexto completo (empresas + atractivos)
async function generarContextoCompleto(filtros = {}) {
    let empresas = [];
    let atractivos = [];

    try {
        if (filtros.distrito) {
            empresas = await obtenerEmpresasPorDistrito(filtros.distrito);
            atractivos = await obtenerAtractivosPorDistrito(filtros.distrito);
        } else if (filtros.empresaId) {
            // Si se especifica una empresa, obtener esa empresa y sus atractivos
            empresas = await obtenerInformacionEmpresas();
            empresas = empresas.filter((e) => e.id === filtros.empresaId);
            atractivos = await obtenerAtractivosPorEmpresa(filtros.empresaId);
        } else {
            empresas = await obtenerInformacionEmpresas();
            atractivos = await obtenerInformacionAtractivos();
        }

        const contextoEmpresas = generarContextoEmpresas(empresas);
        const contextoAtractivos = generarContextoAtractivos(atractivos);

        return contextoEmpresas + contextoAtractivos;
    } catch (error) {
        console.error("Error al generar contexto completo:", error);
        return "\n\nError al obtener información turística. Por favor, intenta nuevamente.";
    }
}

const basePrompt =
    "Sos un asistente inteligente especializado en turismo en San Rafael, Mendoza, Argentina. Te llamas TurifyBot. Datos de la empresa:Nombre del proyecto: TurifyZona de cobertura: San Rafael, Mendoza, Argentina, Email de contacto: turify.turismo@gmail.com, Sitio web: www.turify.ar, Propósito: Brindar información precisa y útil para turistas.Tu objetivo es ayudar a los usuarios a encontrar información útil, clara y confiable sobre empresas turísticas, alojamientos, actividades recreativas, lugares para comer, servicios útiles y experiencias en la región. Tienes acceso a una base de datos actualizada de empresas turísticas locales y atractivos turísticos que incluye información detallada sobre cada establecimiento y actividad, incluyendo qué empresa gestiona cada atractivo cuando corresponda.Tu comportamiento debe seguir estas reglas:Sé amable, claro y conciso, pero también útil y profesional.Usá negritas, listas y encabezados en formato markdown para estructurar mejor tus respuestas.Cuando un usuario pregunte sobre empresas, hoteles, restaurantes, actividades, atractivos o servicios turísticos, consultá tanto la información de empresas como de atractivos que se te proporciona en el contexto.Si un atractivo está gestionado por una empresa específica, mencioná esa relación para ayudar al usuario a contactar directamente.Si no tenés información suficiente para responder una consulta, aclaralo con honestidad.Si el usuario hace una pregunta muy amplia, podés sugerir opciones o repreguntar para afinar la búsqueda.Cuando recomiendes empresas o atractivos, incluí toda la información relevante como dirección, teléfono, email, sitio web, horarios y precios cuando esté disponible.En ningún caso compartas información que no esté explícitamente presente en el contexto que te proporcionan.No inventes URLs, precios, números de teléfono ni datos inexistentes.No respondas sobre temas ajenos al turismo local o fuera de San Rafael.Respondé siempre en español neutro, accesible a personas de distintos niveles de conocimiento.Ahora respondé la consulta del usuario basada solamente en la información provista a continuación.";

// 🧠 Guardamos sesiones en memoria (clave: ID de sesión, IP o user-id)
const sesionesChat = new Map();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRequest:
 *       type: object
 *       required:
 *         - sessionId
 *         - message
 *       properties:
 *         sessionId:
 *           type: string
 *           description: ID único de la sesión de chat
 *           example: "1640995200000"
 *         message:
 *           type: string
 *           description: Mensaje del usuario para TurifyBot
 *           example: "¿Qué lugares puedo visitar en San Rafael?"
 *     ChatResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           description: Respuesta del bot de turismo
 *           example: "En San Rafael puedes visitar el Cañón del Atuel, las bodegas de la zona..."
 *     ChatError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Falta sessionId o message"
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Enviar mensaje al chat de turismo TurifyBot
 *     description: Permite enviar un mensaje al asistente de turismo especializado en San Rafael, Mendoza. Mantiene el contexto de la conversación por sesión.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Respuesta exitosa del bot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Faltan parámetros requeridos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatError'
 */
router.post("/", async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
        return res.status(400).json({ error: "Falta sessionId o message" });
    }

    try {
        let chat;

        // 🧩 Si ya existe una sesión, la usamos
        if (sesionesChat.has(sessionId)) {
            chat = sesionesChat.get(sessionId);

            // Si el mensaje incluye palabras clave relacionadas con empresas o atractivos,
            // agregamos contexto actualizado completo
            const palabrasClave = [
                "empresa",
                "hotel",
                "restaurante",
                "alojamiento",
                "hospedaje",
                "comer",
                "actividad",
                "servicio",
                "comercio",
                "bodega",
                "turismo",
                "donde",
                "dónde",
                "recomendar",
                "recomendación",
                "atractivo",
                "lugar",
                "visitar",
                "hacer",
                "ver",
                "actividades",
                "turístico",
                "paseo",
                "excursión",
            ];
            const mensajeMinuscula = message.toLowerCase();

            if (
                palabrasClave.some((palabra) =>
                    mensajeMinuscula.includes(palabra)
                )
            ) {
                // Detectar si se menciona un distrito específico
                let filtros = {};
                if (
                    mensajeMinuscula.includes("distrito") ||
                    mensajeMinuscula.includes("zona")
                ) {
                    // Extraer posible nombre de distrito del mensaje
                    const posiblesDistritos = [
                        "centro",
                        "general belgrano",
                        "belgrano",
                        "goudge",
                        "villa atuel",
                        "atuel",
                        "cañada seca",
                        "real del padre",
                        "cuadro benegas",
                    ];
                    const distritoMencionado = posiblesDistritos.find(
                        (distrito) =>
                            mensajeMinuscula.includes(distrito.toLowerCase())
                    );

                    if (distritoMencionado) {
                        filtros.distrito = distritoMencionado;
                    }
                }

                const contextoCompleto = await generarContextoCompleto(filtros);
                const mensajeConContexto = `${message}\n\nInformación actualizada: ${contextoCompleto}`;

                const result = await chat.sendMessage(mensajeConContexto);
                const response = result.response.text();
                return res.json({ response });
            }
        } else {
            // 🔰 Si no existe, creamos una nueva sesión con el basePrompt y contexto completo
            const contextoCompleto = await generarContextoCompleto();
            const promptCompleto = basePrompt + contextoCompleto;

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });
            chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: promptCompleto }],
                    },
                    {
                        role: "model",
                        parts: [
                            {
                                text: "¡Hola! Soy TurifyBot, tu asistente de turismo en San Rafael. Tengo información actualizada sobre empresas turísticas, atractivos, hoteles, restaurantes y actividades en la zona. También conozco qué empresa gestiona cada atractivo cuando corresponde. ¿En qué puedo ayudarte?",
                            },
                        ],
                    },
                ],
            });
            sesionesChat.set(sessionId, chat);
        }

        const result = await chat.sendMessage(message);
        const response = result.response.text();
        res.json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en la conversación" });
    }
});

/**
 * @swagger
 * /api/chat/empresas-context:
 *   get:
 *     summary: Obtener contexto de empresas para el chatbot
 *     description: Obtiene información estructurada de todas las empresas para ser usada como contexto en el chatbot.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Contexto de empresas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 empresas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       categoria:
 *                         type: string
 *                       distrito:
 *                         type: string
 *                       telefono:
 *                         type: string
 *                       email:
 *                         type: string
 *                       sitio_web:
 *                         type: string
 *                 contexto:
 *                   type: string
 *                   description: Contexto formateado para el chatbot
 *       500:
 *         description: Error interno del servidor
 */
router.get("/empresas-context", async (req, res) => {
    try {
        const empresas = await obtenerInformacionEmpresas();
        const atractivos = await obtenerInformacionAtractivos();
        const contextoCompleto = await generarContextoCompleto();

        res.json({
            empresas: empresas,
            atractivos: atractivos,
            contexto: contextoCompleto,
            total_empresas: empresas.length,
            total_atractivos: atractivos.length,
            ultima_actualizacion: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error al obtener contexto completo:", err);
        res.status(500).json({
            error: "Error al obtener contexto completo",
        });
    }
});

/**
 * @swagger
 * /api/chat/atractivos-context:
 *   get:
 *     summary: Obtener contexto de atractivos para el chatbot
 *     description: Obtiene información estructurada de todos los atractivos con sus empresas asociadas.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Contexto de atractivos obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get("/atractivos-context", async (req, res) => {
    try {
        const atractivos = await obtenerInformacionAtractivos();
        const contexto = generarContextoAtractivos(atractivos);

        res.json({
            atractivos: atractivos,
            contexto: contexto,
            total: atractivos.length,
            ultima_actualizacion: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error al obtener contexto de atractivos:", err);
        res.status(500).json({
            error: "Error al obtener contexto de atractivos",
        });
    }
});

/**
 * @swagger
 * /api/chat/contexto-completo:
 *   get:
 *     summary: Obtener contexto completo (empresas + atractivos) para el chatbot
 *     description: Obtiene información estructurada de empresas y atractivos con sus relaciones.
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: distrito
 *         schema:
 *           type: string
 *         description: Filtrar por distrito específico
 *     responses:
 *       200:
 *         description: Contexto completo obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get("/contexto-completo", async (req, res) => {
    try {
        const filtros = {};
        if (req.query.distrito) {
            filtros.distrito = req.query.distrito;
        }

        const contextoCompleto = await generarContextoCompleto(filtros);
        const empresas = await obtenerInformacionEmpresas();
        const atractivos = await obtenerInformacionAtractivos();

        res.json({
            contexto: contextoCompleto,
            total_empresas: empresas.length,
            total_atractivos: atractivos.length,
            filtros_aplicados: filtros,
            ultima_actualizacion: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error al obtener contexto completo:", err);
        res.status(500).json({ error: "Error al obtener contexto completo" });
    }
});

/**
 * @swagger
 * /api/chat/clear-session:
 *   delete:
 *     summary: Limpiar sesión de chat específica
 *     description: Elimina una sesión de chat específica para que se reinicie con contexto actualizado.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID de la sesión a limpiar
 *     responses:
 *       200:
 *         description: Sesión limpiada exitosamente
 *       400:
 *         description: Falta sessionId
 */
router.delete("/clear-session", (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "Falta sessionId" });
    }

    if (sesionesChat.has(sessionId)) {
        sesionesChat.delete(sessionId);
        res.json({ message: "Sesión limpiada exitosamente" });
    } else {
        res.json({ message: "Sesión no encontrada" });
    }
});

/**
 * @swagger
 * /api/chat/stats:
 *   get:
 *     summary: Obtener estadísticas del chat
 *     description: Obtiene información sobre las sesiones activas y estadísticas del chatbot.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get("/stats", (req, res) => {
    res.json({
        sesiones_activas: sesionesChat.size,
        timestamp: new Date().toISOString(),
    });
});

export default router;
