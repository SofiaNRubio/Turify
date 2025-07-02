// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import clerk from "@clerk/astro";
import dotenv from "dotenv";
dotenv.config();
// https://astro.build/config
export default defineConfig({
    integrations: [clerk()],
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
        imageService: true,
        imagesConfig: {
            sizes: [320, 640, 1280],
            domains: [],
        },
    }),
    output: "server",
    build: {
        assets: "_astro",
        assetsPrefix: undefined,
    },
    vite: {
        build: {
            rollupOptions: {
                output: {
                    assetFileNames: "_astro/[name].[hash][extname]",
                },
            },
        },
    },
});
