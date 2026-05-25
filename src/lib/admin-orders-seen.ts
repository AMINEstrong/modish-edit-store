import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminOrdersSeenState = {
  lastSeenAt: string | null;
  markSeenNow: () => void;
  markSeenUpTo: (isoTimestamp: string) => void;
};

export const useAdminOrdersSeen = create<AdminOrdersSeenState>()(
  persist(
    (set, get) => ({
      lastSeenAt: null,
      markSeenNow: () => set({ lastSeenAt: new Date().toISOString() }),
      markSeenUpTo: (isoTimestamp) => {
        const current = get().lastSeenAt;
        if (!current || isoTimestamp > current) {
          set({ lastSeenAt: isoTimestamp });
        }
      },
    }),
    { name: "slistyle-admin-orders-seen" },
  ),
);
