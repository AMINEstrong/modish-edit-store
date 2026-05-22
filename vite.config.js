import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { apiDevPlugin } from "./server/vite-api-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    // Root domain (slistyle.com). For subdirectory deploy only, set VITE_BASE_PATH=./
    base: process.env.VITE_BASE_PATH || "/",
    define: envDefine,
    plugins: [
      apiDevPlugin(),
      tanstackRouter({
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      }),
      react(),
      tailwindcss(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      assetsDir: "assets",
      assetsInlineLimit: 0,
    },
    server: {
      host: "::",
      port: 8080,
    },
  };
});
