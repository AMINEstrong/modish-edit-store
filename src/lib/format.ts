export const CURRENCY = "MAD" as const;

/** Free shipping when cart subtotal exceeds this amount (MAD). */
export const FREE_SHIPPING_THRESHOLD = 0;

/** Flat shipping fee (MAD) when below free-shipping threshold. */
export const SHIPPING_FEE = 0;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(n);

const COLOR_NAMES: Record<string, string> = {
  "#0d0d0d": "Noir",
  "#000000": "Noir",
  "#ffffff": "Blanc",
  "#fff": "Blanc",
  "#f5f5f0": "Écru",
  "#c5a880": "Doré",
  "#1e3a5f": "Bleu marine",
  "#8b4513": "Marron",
  "#808080": "Gris",
};

/** Human-readable colour for cart, checkout, and admin orders. */
export function formatColorLabel(color: string | null | undefined): string {
  const raw = (color ?? "").trim();
  if (!raw) return "—";
  const named = COLOR_NAMES[raw.toLowerCase()];
  if (named) return named;
  if (raw.startsWith("#")) return raw.toUpperCase();
  return raw;
}

export function formatSizeLabel(size: string | null | undefined): string {
  const raw = (size ?? "").trim();
  return raw || "—";
}
