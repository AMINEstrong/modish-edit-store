import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAdminOrdersSeen } from "@/lib/admin-orders-seen";
import { playNewOrderSound } from "@/lib/new-order-sound";
import { useAuth } from "@/hooks/use-auth";

const POLL_MS = 12_000;

type BadgeStore = {
  newCount: number;
  setNewCount: (n: number) => void;
};

export const useAdminOrdersBadgeStore = create<BadgeStore>((set) => ({
  newCount: 0,
  setNewCount: (newCount) => set({ newCount }),
}));

const prevCountRef = { current: 0 };
let isFirstFetch = true;

export async function refreshAdminNewOrdersCount(): Promise<number> {
  const seenSince =
    useAdminOrdersSeen.getState().lastSeenAt ?? "1970-01-01T00:00:00.000Z";

  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gt("created_at", seenSince);

  if (error) {
    console.warn("[admin-new-orders]", error.message);
    return useAdminOrdersBadgeStore.getState().newCount;
  }

  const next = count ?? 0;
  useAdminOrdersBadgeStore.getState().setNewCount(next);

  if (!isFirstFetch && next > prevCountRef.current) {
    playNewOrderSound();
  }

  isFirstFetch = false;
  prevCountRef.current = next;
  return next;
}

/** Poll + Supabase realtime — mount once in admin layout. */
export function useAdminNewOrders() {
  const { isAdmin, loading: authLoading } = useAuth();
  const newCount = useAdminOrdersBadgeStore((s) => s.newCount);

  const fetchNewCount = useCallback(async () => {
    if (!isAdmin) {
      useAdminOrdersBadgeStore.getState().setNewCount(0);
      return 0;
    }
    return refreshAdminNewOrdersCount();
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;

    void fetchNewCount();

    const interval = window.setInterval(() => {
      void fetchNewCount();
    }, POLL_MS);

    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          void fetchNewCount();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        () => {
          void fetchNewCount();
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [authLoading, isAdmin, fetchNewCount]);

  return { newCount, refresh: fetchNewCount };
}
