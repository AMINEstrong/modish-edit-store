/**
 * Generate @2x hero JPEGs (Lanczos upscale + light sharpen) for Retina / wide screens.
 * Run: npm run optimize:heroes
 */
import sharp from "sharp";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "../src/assets");

const jobs = [
  { file: "hero-banner.jpg", width: 2560 },
  { file: "hero-homme.jpg", width: 2560 },
  { file: "hero-femme.jpg", width: 1536 },
];

for (const { file, width } of jobs) {
  const input = resolve(assetsDir, file);
  const output = resolve(assetsDir, file.replace(/\.jpg$/i, "@2x.jpg"));
  if (!existsSync(input)) {
    console.warn("Skip (missing):", file);
    continue;
  }
  await sharp(input)
    .resize({ width, withoutEnlargement: false })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(output);
  const meta = await sharp(output).metadata();
  console.log(`Wrote ${file.replace(".jpg", "@2x.jpg")} → ${meta.width}×${meta.height}`);
}

console.log("Done. Commit the new @2x.jpg files.");
