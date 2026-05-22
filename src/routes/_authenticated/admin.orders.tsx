import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteOrder, updateOrderStatus } from "@/lib/orders";
import { toast } from "sonner";
import { formatColorLabel, formatPrice, formatSizeLabel } from "@/lib/format";
import { formatPaymentMethod } from "@/lib/payment";

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
  payment_method?: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      toast.success("Statut mis à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mise à jour impossible");
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (
      !window.confirm(
        "Supprimer cette commande et tous ses articles ? Action définitive.",
      )
    ) {
      return;
    }
    setDeletingId(orderId);
    try {
      await deleteOrder(orderId);
      if (open === orderId) setOpen(null);
      toast.success("Commande supprimée");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
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
              <div className="flex items-stretch">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : o.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4 py-4 text-left hover:bg-secondary/50"
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
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(o.id);
                }}
                disabled={deletingId === o.id}
                className="flex w-12 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                aria-label="Supprimer la commande"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              </div>

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
                      <p className="mt-3 text-sm">
                        <span className="text-muted-foreground">Payment: </span>
                        {formatPaymentMethod(o.payment_method ?? "cash_on_delivery")}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow mb-3">Articles commandés</p>
                      <ul className="space-y-3 text-sm">
                        {(o.order_items ?? []).map((it) => (
                          <li
                            key={it.id}
                            className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {it.quantity}× {it.product_name}
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  <span className="text-foreground/80">Taille :</span>{" "}
                                  {formatSizeLabel(it.size)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="text-foreground/80">Couleur :</span>{" "}
                                  {formatColorLabel(it.color)}
                                  <span
                                    className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-border"
                                    style={{ backgroundColor: it.color }}
                                    title={it.color}
                                  />
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 font-medium">
                              {formatPrice(Number(it.unit_price) * it.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
                        <span>Total</span>
                        <span>{formatPrice(Number(o.total))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="label-eyebrow">Statut</span>
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id)}
                      disabled={deletingId === o.id}
                      className="label-eyebrow inline-flex items-center gap-2 border border-destructive/40 px-4 py-2 text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === o.id ? "Suppression…" : "Supprimer"}
                    </button>
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
