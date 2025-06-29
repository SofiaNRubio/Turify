import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import specs from "../swaggerConfig.js";
import { initializedb } from "./db.js";
import empresasRoutes from "./routes/empresas.js";
import atractivosRoutes from "./routes/atractivos.js";
import gestionRoutes from "./routes/gestion.js";
import categoriasRoutes from "./routes/categorias.js";
import rutasRoutes from "./routes/rutas.js";
import usuariosRoutes from "./routes/usuarios.js";
import resenasRouter from "./routes/resenas.js";
import favoritosRoutes from "./routes/favoritos.js";
import chatRoutes from "./routes/chat.js";
// Rutas de administración
import adminResenasRouter from "./api/admin/resenas.js";
import estadisticasRouter from "./api/admin/estadisticas.js";
import adminUsuariosRouter from "./api/admin/usuarios.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.get("/", (req, res) => {
    res.send("Turify API funcionando 🚀");
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Rutas principales de la API
app.use("/api/empresas", empresasRoutes);
app.use("/api/busqueda", busquedaRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/atractivos", atractivosRoutes);
app.use("/api/gestion", gestionRoutes); // Mantener gestion como endpoint separado si tiene funcionalidades adicionales
app.use("/api/categorias", categoriasRoutes);
app.use("/api/rutas", rutasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/resenas", resenasRouter);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/chat", chatRoutes);

// Rutas de administración
app.use("/api/admin/resenas", adminResenasRouter);
app.use("/api/admin/estadisticas", estadisticasRouter);
app.use("/api/admin/usuarios", adminUsuariosRouter);

// Servidor
const PORT = process.env.PORT || 3000;

// Inicializar la base de datos
async function startServer() {
    try {
        await initializedb();
        console.log("Base de datos inicializada exitosamente");

        app.listen(PORT, () => {
            console.log(
                `Servidor backend corriendo en http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error("Error al inicializar el servidor:", error);
        process.exit(1);
    }
}

startServer();
