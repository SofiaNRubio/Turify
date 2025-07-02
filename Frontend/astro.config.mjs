// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
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
    }),
    output: "server",
});
