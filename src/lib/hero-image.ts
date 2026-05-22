/** Default hero dimensions (full-width backgrounds). */
export const HERO_SIZE = {
  banner: { width: 1920, height: 1080, targetWidth: 1920 },
  homme: { width: 1920, height: 1080, targetWidth: 1920 },
  femme: { width: 1920, height: 1080, targetWidth: 1920 },
  /** Split category cards (portrait 3:4 crop). */
  femmeCard: { width: 1920, height: 2560, targetWidth: 1920 },
} as const;

export type HeroVariant = keyof typeof HERO_SIZE;

export const HERO_MIN_WIDTH = {
  banner: HERO_SIZE.banner.width,
  landscape: HERO_SIZE.homme.width,
  portrait: HERO_SIZE.femmeCard.width,
} as const;

/**
 * Supabase Storage: serve via image renderer at high quality (downscale only).
 */
export function resolveHeroImageUrl(
  src: string,
  targetWidth: number = HERO_SIZE.banner.targetWidth,
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
    return `Image ${dims.width}×${dims.height} px — pour un fond net, utilisez au moins ${min}×${HERO_SIZE.banner.height} px.`;
  }
  return null;
}
