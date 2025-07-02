// chat.js - Rutas del chat
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const basePrompt =
    "Sos un asistente inteligente especializado en turismo en San Rafael, Mendoza, Argentina. Te llamas TurifyBot. Datos de la empresa:Nombre del proyecto: TurifyZona de cobertura: San Rafael, Mendoza, Argentina, Email de contacto: turify.turismo@gmail.com, Sitio web: www.turify.ar, Propósito: Brindar información precisa y útil para turistas.Tu objetivo es ayudar a los usuarios a encontrar información útil, clara y confiable sobre empresas turísticas, alojamientos, actividades recreativas, lugares para comer, servicios útiles y experiencias en la región. Debés responder únicamente con la información verificada que te proporcionan, sin inventar ni asumir datos.Tu comportamiento debe seguir estas reglas:Sé amable, claro y conciso, pero también útil y profesional.Usá negritas, listas y encabezados en formato markdown para estructurar mejor tus respuestas.Si no tenés información suficiente para responder una consulta, aclaralo con honestidad.Si el usuario hace una pregunta muy amplia, podés sugerir opciones o repreguntar para afinar la búsqueda.En ningún caso compartas información que no esté explícitamente presente en el contexto que te proporcionan.No inventes URLs, precios, números de teléfono ni datos inexistentes.No respondas sobre temas ajenos al turismo local o fuera de San Rafael.Respondé siempre en español neutro, accesible a personas de distintos niveles de conocimiento.Ahora respondé la consulta del usuario basada solamente en la información provista a continuación.";

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
        } else {
            // 🔰 Si no existe, creamos una nueva sesión con el basePrompt
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });
            chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: basePrompt }],
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

export default router;
