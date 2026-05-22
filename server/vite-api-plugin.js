import express from "express";
import { loadEnv } from "vite";
import { registerApiRoutes } from "./api.mjs";

/** Mount /api/* on the Vite dev server (no separate `dev:server` needed). */
export function apiDevPlugin() {
  return {
    name: "slistyle-api-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      const api = express();
      api.use(express.json({ limit: "1mb" }));
      registerApiRoutes(api);

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api")) return next();
        api(req, res, next);
      });
    },
  };
}
