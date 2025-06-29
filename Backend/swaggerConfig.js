import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Estas líneas reemplazan a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Turify",
            version: "1.0.0",
            description: "API de turismo para San Rafael, Mendoza",
        },
        tags: [
            {
                name: "Chat",
                description: "Endpoints del chat de turismo TurifyBot",
            },
        ],
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local",
            },
        ],
    },
    apis: [
        resolve(__dirname, "src/routes/empresas.js"),
        resolve(__dirname, "src/routes/chat.js"),
    ],
};

const specs = swaggerJsdoc(options);

export default specs;
