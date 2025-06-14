// server.js (actualizado)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generarPromptBase } from "./generarContexto.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const basePrompt = generarPromptBase();

// 🧠 Guardamos sesiones en memoria (clave: ID de sesión, IP o user-id)
const sesionesChat = new Map();

app.post("/api/chat", async (req, res) => {
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

app.listen(3001, () => console.log("Servidor en http://localhost:3001"));
