import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, ".htaccess");
const dest = join(root, "dist", ".htaccess");

if (!existsSync(join(root, "dist", "index.html"))) {
  console.error("[copy-htaccess] dist/index.html missing — run vite build first");
  process.exit(1);
}

copyFileSync(src, dest);
console.log("[copy-htaccess] dist/.htaccess ready for Hostinger public_html");
