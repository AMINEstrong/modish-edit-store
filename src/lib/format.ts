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
