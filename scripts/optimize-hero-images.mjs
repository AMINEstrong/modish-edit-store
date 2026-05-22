/**
 * Normalize hero JPEGs to 1920px width (default site size).
 * Run: npm run optimize:heroes
 */
import sharp from "sharp";
import { existsSync, renameSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "../src/assets");

const WIDTH = 1920;

/** Prefer highest-res source when available. */
const jobs = [
  {
    out: "hero-banner.jpg",
    sources: ["hero", "hero-banner.jpg", "h.jpg"],
    height: 1080,
    fit: "cover",
  },
  {
    out: "hero-homme.jpg",
    sources: ["hero", "h.jpg", "hero-homme.jpg"],
    height: 1080,
    fit: "cover",
  },
  {
    out: "hero-femme.jpg",
    sources: ["hero-femme.jpg", "hero"],
    height: 1080,
    fit: "cover",
  },
];

async function pickSource(sources) {
  let best = null;
  let bestPixels = 0;
  for (const name of sources) {
    const path = resolve(assetsDir, name);
    if (!existsSync(path)) continue;
    const meta = await sharp(path).metadata();
    const pixels = (meta.width ?? 0) * (meta.height ?? 0);
    if (pixels > bestPixels) {
      bestPixels = pixels;
      best = path;
    }
  }
  return best;
}

for (const job of jobs) {
  const input = await pickSource(job.sources);
  if (!input) {
    console.warn("Skip (no source):", job.out);
    continue;
  }

  const output = resolve(assetsDir, job.out);
  const temp = `${output}.tmp.jpg`;
  let pipeline = sharp(input).resize({
    width: WIDTH,
    height: job.height ?? undefined,
    fit: job.fit,
    withoutEnlargement: false,
  });

  if (job.fit === "cover") {
    pipeline = pipeline.sharpen({ sigma: 0.4, m1: 0.5, m2: 0.25 });
  }

  await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(temp);
  if (existsSync(output)) unlinkSync(output);
  renameSync(temp, output);

  const meta = await sharp(output).metadata();
  console.log(`${job.out} ← ${input.split(/[/\\]/).pop()} → ${meta.width}×${meta.height}`);
}

console.log(`Done. All heroes normalized to ${WIDTH}px width.`);
