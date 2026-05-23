import { create } from "zustand";

type CartNotificationState = {
  open: boolean;
  productName: string;
  show: (productName: string) => void;
  dismiss: () => void;
};

export const useCartNotification = create<CartNotificationState>((set) => ({
  open: false,
  productName: "",
  show: (productName) => set({ open: true, productName }),
  dismiss: () => set({ open: false }),
}));
