/** Minimum display widths (CSS px) — below this, heroes look soft on large/Retina screens. */
export const HERO_MIN_WIDTH = {
  banner: 1920,
  landscape: 1920,
  portrait: 1200,
} as const;

/**
 * Supabase Storage: serve via image renderer at high quality (downscale only).
 * Leaves non-Supabase URLs unchanged.
 */
export function resolveHeroImageUrl(
  src: string,
  targetWidth: number = 2560,
): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;

  try {
    const url = new URL(src);
    if (!url.hostname.includes("supabase.co")) return src;
    if (!url.pathname.includes("/storage/v1/object/public/")) return src;

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    url.search = "";
    url.searchParams.set("width", String(targetWidth));
    url.searchParams.set("quality", "92");
    return url.toString();
  } catch {
    return src;
  }
}

export function buildSrcSet(
  src: string,
  src2x?: string,
  targetWidth2x: number = 2560,
): string | undefined {
  const oneX = resolveHeroImageUrl(src, Math.round(targetWidth2x / 2));
  if (!src2x) return undefined;
  const twoX =
    src2x === src ? resolveHeroImageUrl(src, targetWidth2x) : resolveHeroImageUrl(src2x, targetWidth2x);
  if (oneX === twoX) return undefined;
  return `${oneX} 1x, ${twoX} 2x`;
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire l'image."));
    };
    img.src = objectUrl;
  });
}

export function heroDimensionWarning(
  file: File,
  dims: { width: number; height: number },
  kind: keyof typeof HERO_MIN_WIDTH,
): string | null {
  const min = HERO_MIN_WIDTH[kind];
  if (dims.width < min) {
    return `Image ${dims.width}×${dims.height} px — pour un fond net, utilisez au moins ${min}px de largeur (idéal 2560px).`;
  }
  return null;
}
