import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

export type CartItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
  product: Product;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  setQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

const key = (productId: string, size: string, color: string) =>
  `${productId}__${size}__${color}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const k = key(item.productId, item.size, item.color);
          const idx = s.items.findIndex(
            (i) => key(i.productId, i.size, i.color) === k,
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
            return { items: next };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter(
            (i) => key(i.productId, i.size, i.color) !== key(productId, size, color),
          ),
        })),
      setQuantity: (productId, size, color, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              key(i.productId, i.size, i.color) === key(productId, size, color)
                ? { ...i, quantity: Math.max(1, qty) }
                : i,
            ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, i) => a + i.quantity, 0),
      total: () => get().items.reduce((a, i) => a + i.quantity * i.product.price, 0),
    }),
    { name: "maison-cart" },
  ),
);

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: () => number;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: "maison-wishlist" },
  ),
);
