import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import specs from "../swaggerConfig.js";
import empresasRoutes from "./routes/empresas.js";
import usuariosAdminRoutes from "./api/admin/usuarios.js";
import reseniasAdminRoutes from "./api/admin/reseñas.js";
import estadisticasAdminRoutes from "./api/admin/estadisticas.js";

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

app.use("/api/empresas", empresasRoutes);
app.use("/api/admin/usuarios", usuariosAdminRoutes);
app.use("/api/admin/reseñas", reseniasAdminRoutes);
app.use("/api/admin/estadisticas", estadisticasAdminRoutes);

// Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
