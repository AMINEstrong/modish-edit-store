export const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}
