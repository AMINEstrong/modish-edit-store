import type { Product } from "@/lib/products";

/** Ensures size & colour are always saved on orders (never empty / undefined). */
export function resolveLineOptions(
  product: Product,
  size?: string | null,
  color?: string | null,
): { size: string; color: string } {
  const resolvedSize =
    (size ?? "").trim() ||
    product.sizes.find((s) => (s ?? "").trim())?.trim() ||
    "Taille unique";

  const resolvedColor =
    (color ?? "").trim() ||
    product.colors.find((c) => (c ?? "").trim())?.trim() ||
    "Couleur unique";

  return { size: resolvedSize, color: resolvedColor };
}
