/** 4K-ready hero dimensions (16:9). */
export const HERO_SIZE = {
  banner: { width: 3840, height: 2160, targetWidth: 3840 },
  homme: { width: 3840, height: 2160, targetWidth: 3840 },
  femme: { width: 3840, height: 2160, targetWidth: 3840 },
  femmeCard: { width: 3840, height: 5120, targetWidth: 3840 },
} as const;

export type HeroVariant = keyof typeof HERO_SIZE;

export const HERO_MIN_WIDTH = {
  banner: 1920,
  landscape: 1920,
  portrait: 1920,
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
    url.searchParams.set("quality", "90");
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
    return `Image ${dims.width}×${dims.height} px — idéal 3840×2160 px (4K) ou minimum ${min}px de large.`;
  }
  return null;
}
