import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

export const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN,
});

export async function initializedb() {
    try {
        // Crear tabla categorias
        await db.execute(`
            CREATE TABLE IF NOT EXISTS categorias (
                id TEXT PRIMARY KEY,
                nombre TEXT
            )
        `);

        // Crear tabla empresas
        await db.execute(`
            CREATE TABLE IF NOT EXISTS empresas (
                id TEXT PRIMARY KEY,
                nombre TEXT,
                descripcion TEXT,
                email TEXT,
                telefono TEXT,
                sitio_web TEXT,
                direccion TEXT,
                latitud REAL,
                longitud REAL,
                img_url TEXT,
                categoria_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            )
        `);

        // Crear tabla atractivos
        await db.execute(`
            CREATE TABLE IF NOT EXISTS atractivos (
                id TEXT PRIMARY KEY,
                nombre TEXT,
                descripcion TEXT,
                empresa_id TEXT,
                categoria_id TEXT,
                latitud REAL,
                longitud REAL,
                direccion TEXT,
                img_url TEXT,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id),
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            )
        `);

        // Crear tabla rutas
        await db.execute(`
            CREATE TABLE IF NOT EXISTS rutas (
                id TEXT PRIMARY KEY,
                nombre TEXT,
                descripcion TEXT,
                creador_empresa_id TEXT,
                img_url TEXT,
                creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creador_empresa_id) REFERENCES empresas(id)
            )
        `);

        // Crear tabla rutas_atractivos (relación muchos a muchos)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS rutas_atractivos (
                ruta_id TEXT,
                atractivo_id TEXT,
                orden INTEGER,
                PRIMARY KEY (ruta_id, atractivo_id),
                FOREIGN KEY (ruta_id) REFERENCES rutas(id),
                FOREIGN KEY (atractivo_id) REFERENCES atractivos(id)
            )
        `);

        // Crear tabla reseñas
        await db.execute(`
            CREATE TABLE IF NOT EXISTS reseñas (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                atractivo_id TEXT,
                comentario TEXT,
                puntaje INTEGER,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (atractivo_id) REFERENCES atractivos(id)
            )
        `);

        // Crear tabla favoritos
        await db.execute(`
            CREATE TABLE IF NOT EXISTS favoritos (
                user_id TEXT,
                atractivo_id TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, atractivo_id),
                FOREIGN KEY (atractivo_id) REFERENCES atractivos(id)
            )
        `);

        console.log("Base de datos inicializada correctamente");
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
        throw error;
    }
}
