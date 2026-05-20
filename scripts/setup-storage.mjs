/**
 * Crée le bucket product-images sur le projet Supabase défini dans .env
 * Usage: node scripts/setup-storage.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const vars = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    vars[k] = v;
  }
  return vars;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "product-images";

if (!url || !key) {
  console.error("Manque SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env");
  process.exit(1);
}

const res = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: bucket,
    name: bucket,
    public: true,
    file_size_limit: 5242880,
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }),
});

if (res.ok) {
  console.log(`Bucket "${bucket}" créé sur ${url}`);
  process.exit(0);
}

const body = await res.text();
if (body.includes("already exists") || res.status === 409) {
  console.log(`Bucket "${bucket}" existe déjà.`);
  process.exit(0);
}

console.error("Erreur:", res.status, body);
process.exit(1);
