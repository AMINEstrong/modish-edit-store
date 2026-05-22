import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { deleteOrder } from "@/lib/orders";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Your account — Slistyle" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; size: string }[];
};

function AccountPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id,total,status,created_at,order_items(id,product_name,quantity,size)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data as Order[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDelete = async (orderId: string) => {
    if (
      !window.confirm(
        "Supprimer cette commande ? Cette action est définitive.",
      )
    ) {
      return;
    }
    setDeletingId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Commande supprimée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-eyebrow text-muted-foreground">Account</p>
          <h1 className="mt-2 font-serif text-5xl">Hello.</h1>
          <p className="mt-3 text-sm text-muted-foreground">{user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <div className="flex flex-col gap-2 text-right">
          {isAdmin && (
            <Link to="/admin/products" className="label-eyebrow underline underline-offset-4">
              Admin dashboard
            </Link>
          )}
          <button onClick={signOut} className="label-eyebrow text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-2xl">Your orders</h2>
        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-4 border border-border px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                <p className="text-sm">
                  {o.order_items.length} {o.order_items.length === 1 ? "article" : "articles"} ·{" "}
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(Number(o.total))}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {o.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(o.id)}
                  disabled={deletingId === o.id}
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-50"
                  aria-label="Supprimer la commande"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
