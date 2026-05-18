import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

type OrderItem = {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: string;
  email: string;
  full_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    refresh();
  };

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
      </p>

      <div className="space-y-3">
        {orders.map((o) => {
          const isOpen = open === o.id;
          return (
            <div key={o.id} className="border border-border">
              <button
                onClick={() => setOpen(isOpen ? null : o.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-secondary/50"
              >
                <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Order</p>
                    <p className="font-mono text-xs">#{o.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-sm">{o.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-medium">{formatPrice(Number(o.total))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                      o.status === "delivered" ? "bg-foreground text-background"
                      : o.status === "cancelled" ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary"
                    }`}>{o.status}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isOpen && (
                <div className="border-t border-border bg-secondary/30 px-4 py-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="label-eyebrow mb-3">Shipping</p>
                      <p className="text-sm">{o.full_name}</p>
                      <p className="text-sm">{o.email}</p>
                      {o.phone && <p className="text-sm">{o.phone}</p>}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {o.address}<br />
                        {o.postal_code} {o.city}<br />
                        {o.country}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow mb-3">Items</p>
                      <ul className="space-y-2 text-sm">
                        {o.order_items.map((it) => (
                          <li key={it.id} className="flex justify-between">
                            <span>
                              {it.quantity}× {it.product_name}
                              <span className="text-xs text-muted-foreground"> · {it.size} · </span>
                              <span
                                className="inline-block h-2 w-2 align-middle rounded-full"
                                style={{ backgroundColor: it.color }}
                              />
                            </span>
                            <span>{formatPrice(Number(it.unit_price) * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
                        <span>Total</span>
                        <span>{formatPrice(Number(o.total))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    <span className="label-eyebrow">Update status</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border border-border bg-background px-3 py-2 text-sm"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && orders.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </>
  );
}
