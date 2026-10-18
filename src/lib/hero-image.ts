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
 * Serve the public Storage object URL.
 * Image Transformations (`/render/image/`) return 403 on this project, so we
 * never rewrite to that endpoint — and convert any stored render URLs back.
 */
export function resolveHeroImageUrl(src: string, _targetWidth?: number): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;

  try {
    const url = new URL(src);
    if (!url.hostname.includes("supabase.co")) return src;

    if (url.pathname.includes("/storage/v1/render/image/public/")) {
      url.pathname = url.pathname.replace(
        "/storage/v1/render/image/public/",
        "/storage/v1/object/public/",
      );
      url.search = "";
      return url.toString();
    }

    return src;
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
