import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/store";
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/format";
import { toast } from "sonner";
import { placeOrder } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Slistyle" },
      { name: "description", content: "Complete your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.items.reduce((a, i) => a + i.quantity * i.product.price, 0));
  const clear = useCart((s) => s.clear);
  const [form, setForm] = useState({
    full_name: "", 
    email: user?.email ?? "guest@slistyle.com", 
    phone: "",
    address: "", 
    city: "", 
    postal_code: "", 
    country: "Maroc",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const shipping = total > FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_FEE;
  const grand = total + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <button
          onClick={() => navigate({ to: "/" })}
          className="label-eyebrow mt-6 border border-foreground px-6 py-3"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    setSaving(true);
    try {
      console.log("📦 Starting order submission on server...", { user_id: user?.id ?? null, form: parsed.data });

      const orderResult = await placeOrder({
        userId: user?.id ?? null,
        orderData: parsed.data,
        items: items.map((i) => ({
          productSlug: i.product.slug,
          productName: i.product.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        total: grand,
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Could not place order");
      }

      console.log("✅ Order placed successfully on server:", orderResult.orderId);

      clear();
      toast.success("Order placed. Thank you.");
      console.log("🎉 Order completed successfully");
      navigate({ to: "/" });
    } catch (err) {
      console.error("💥 Full error object:", err);
      const message = err instanceof Error ? err.message : "Could not place order";
      console.error("🚨 Final error message:", message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-5xl">Checkout</h1>
      {!user && (
        <p className="mt-2 text-sm text-muted-foreground">
          Ordering as a guest — no account needed
        </p>
      )}

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="label-eyebrow">Contact & shipping</h2>
          <Field label="Full name">
            <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
          </Field>
          <Field label="Address">
            <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Postal code">
              <input required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input" />
            </Field>
            <Field label="City">
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
            </Field>
            <Field label="Country">
              <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Phone (optional)">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="label-eyebrow mt-4 w-full bg-foreground py-4 text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Placing order…" : `Place order — ${formatPrice(grand)}`}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Payment will be collected upon shipment. Card payment coming next.
          </p>
        </form>

        <aside className="h-fit border border-border p-6">
          <p className="label-eyebrow mb-4">Your bag</p>
          <ul className="space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between gap-3">
                <span className="flex-1">
                  {i.quantity}× {i.product.name}
                  <span className="block text-xs text-muted-foreground">Size {i.size}</span>
                </span>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium"><span>Total</span><span>{formatPrice(grand)}</span></div>
          </div>
        </aside>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);padding:0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--foreground)}`}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-eyebrow mb-2 block">{label}</span>
      {children}
    </label>
  );
}
