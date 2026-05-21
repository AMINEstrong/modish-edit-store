import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Hostinger Business (Node.js): Nitro node-server preset — not Cloudflare Workers.
// Deploy: npm run build && npm start (listens on PORT, default 3000).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [
    nitro({
      preset: "node-server",
    }),
  ],
});
