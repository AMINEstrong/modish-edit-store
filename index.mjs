import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerApiRoutes } from "./server/api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const distDir = path.join(__dirname, "dist");
const indexHtml = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error(
    "[server] dist/index.html not found. Run: npm run build",
  );
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "1mb" }));

registerApiRoutes(app);

app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  next();
});

app.use(
  express.static(distDir, {
    index: "index.html",
    extensions: ["html"],
    fallthrough: true,
  }),
);

app.use((req, res, next) => {
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
});

app.use((err, _req, res, _next) => {
  console.error("[server]", err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, HOST, () => {
  console.log(`SLISTYLE server → http://${HOST}:${PORT}/`);
  console.log(`Static files from ${distDir}`);
});
