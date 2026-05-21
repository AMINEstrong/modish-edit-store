/**
 * Hostinger requires a visible output directory (dist/) after build.
 * Copies Nitro server + public assets into dist/ so checks pass and
 * Entry file can be dist/server/index.mjs if hPanel asks for it.
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nitroOut = join(root, ".output");
const serverEntry = join(nitroOut, "server", "index.mjs");
const hostingerDist = join(root, "dist");

if (!existsSync(serverEntry)) {
  console.error("[hostinger-postbuild] Missing:", serverEntry);
  console.error("vite build did not produce the Nitro server bundle.");
  process.exit(1);
}

mkdirSync(hostingerDist, { recursive: true });

const publicDir = join(nitroOut, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, join(hostingerDist, "public"), { recursive: true });
}

cpSync(join(nitroOut, "server"), join(hostingerDist, "server"), { recursive: true });

writeFileSync(
  join(hostingerDist, "hostinger-build.json"),
  `${JSON.stringify(
    {
      type: "tanstack-start-nitro",
      serverEntry: "dist/server/index.mjs",
      startCommand: "npm start",
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);

console.log("[hostinger-postbuild] dist/ ready (server: dist/server/index.mjs)");
