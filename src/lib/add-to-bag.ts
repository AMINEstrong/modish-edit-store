import type { CartItem } from "@/lib/store";
import { useCart } from "@/lib/store";
import { useCartNotification } from "@/lib/cart-notification";

export function addToBag(item: CartItem): void {
  useCart.getState().add(item);
  useCartNotification.getState().show(item.product.name);
}
