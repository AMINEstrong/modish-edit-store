import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
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

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,total,status,created_at,order_items(id,product_name,quantity,size)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setOrders(data as Order[]);
        setLoading(false);
      });
  }, [user]);

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
            <div key={o.id} className="flex items-center justify-between border border-border px-4 py-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                <p className="text-sm">
                  {o.order_items.length} {o.order_items.length === 1 ? "piece" : "pieces"} ·{" "}
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatPrice(Number(o.total))}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{o.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
