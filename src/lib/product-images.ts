import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function validateProductImage(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Format accepté : JPEG, PNG, WebP ou GIF.";
  }
  if (file.size > MAX_BYTES) {
    return "L'image ne doit pas dépasser 5 Mo.";
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.readAsDataURL(file);
  });
}

function isBucketMissingError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("bucket not found") || m.includes("bucket does not exist");
}

async function uploadToStorage(file: File, slug: string): Promise<string> {
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${safeSlug}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductImage(file: File, slug: string): Promise<string> {
  const err = validateProductImage(file);
  if (err) throw new Error(err);

  try {
    return await uploadToStorage(file, slug);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (!isBucketMissingError(message)) throw e;

    // Fallback: enregistre l'image en base (data URL) si le bucket Storage n'existe pas encore
    console.warn(
      `[Storage] Bucket "${BUCKET}" introuvable sur ce projet Supabase — utilisation d'un data URL.`,
    );
    return readFileAsDataUrl(file);
  }
}

export const STORAGE_SETUP_HINT =
  "Créez le bucket « product-images » (public) dans Supabase → Storage, ou exécutez le script supabase/scripts/create-product-images-bucket.sql dans l'éditeur SQL.";
