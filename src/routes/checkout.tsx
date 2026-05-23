import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/store";
import { resolveLineOptions } from "@/lib/cart-line";
import { formatColorLabel, formatPrice, formatSizeLabel, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/format";
import { toast } from "sonner";
import { placeOrder } from "@/lib/api";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment";

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
  full_name: z.string().trim().min(1, "Nom requis").max(120),
  address: z.string().trim().min(1, "Adresse requise").max(255),
  phone: z.string().trim().min(1, "Téléphone requis").max(40),
  payment_method: z.enum(["cash_on_delivery"]),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.items.reduce((a, i) => a + i.quantity * i.product.price, 0));
  const clear = useCart((s) => s.clear);
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    phone: "",
    payment_method: "cash_on_delivery" as PaymentMethod,
  });
  const [saving, setSaving] = useState(false);

  const shipping = total > FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_FEE;
  const grand = total + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
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
      toast.error(parsed.error.errors[0]?.message ?? "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const orderResult = await placeOrder({
        userId: user?.id ?? null,
        orderData: {
          ...parsed.data,
          email: user?.email ?? "guest@slistyle.com",
          city: "—",
          postal_code: "—",
          country: "Maroc",
        },
        items: items.map((i) => {
          const line = resolveLineOptions(i.product, i.size, i.color);
          return {
            productSlug: i.product.slug,
            productName: i.product.name,
            size: line.size,
            color: line.color,
            quantity: i.quantity,
            unitPrice: i.product.price,
          };
        }),
        total: grand,
      });

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Could not place order");
      }

      clear();
      toast.success("Commande enregistrée. Merci !");
      navigate({ to: "/" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de passer la commande";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-5xl">Checkout</h1>
      {!user && (
        <p className="mt-2 text-sm text-muted-foreground">
          Commande invité — aucun compte requis
        </p>
      )}

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="label-eyebrow">Livraison</h2>
          <Field label="Nom complet *">
            <input
              required
              autoComplete="name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Adresse *">
            <input
              required
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Téléphone *">
            <input
              required
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="06 XX XX XX XX"
            />
          </Field>

          <h2 className="label-eyebrow pt-4">Paiement</h2>
          <Field label="Mode de paiement">
            <select
              required
              value={form.payment_method}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_method: e.target.value as PaymentMethod,
                })
              }
              className="input"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-xs text-muted-foreground">
            Paiement en espèces à la livraison.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="label-eyebrow mt-4 w-full bg-foreground py-4 text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Commande en cours…" : `Commander — ${formatPrice(grand)}`}
          </button>
        </form>

        <aside className="h-fit border border-border p-6">
          <p className="label-eyebrow mb-4">Your bag</p>
          <ul className="space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between gap-3">
                <span className="flex-1">
                  {i.quantity}× {i.product.name}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Taille {formatSizeLabel(i.size)} · Couleur {formatColorLabel(i.color)}
                  </span>
                </span>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>{formatPrice(grand)}</span>
            </div>
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
