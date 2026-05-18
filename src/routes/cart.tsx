import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Maison" },
      { name: "description", content: "Review your bag before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const total = useCart((s) => s.items.reduce((a, i) => a + i.quantity * i.product.price, 0));

  const shipping = total > 200 || total === 0 ? 0 : 15;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <p className="label-eyebrow text-muted-foreground">Empty</p>
        <h1 className="mt-3 font-serif text-5xl">Your bag is empty.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Pieces you add will appear here.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/femme" className="label-eyebrow border border-foreground bg-foreground px-6 py-3 text-background">
            Shop Femme
          </Link>
          <Link to="/homme" className="label-eyebrow border border-foreground px-6 py-3">
            Shop Homme
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-5xl">Your bag</h1>
      <p className="label-eyebrow mt-2 text-muted-foreground">
        {items.length} {items.length === 1 ? "piece" : "pieces"}
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 py-6"
            >
              <Link to="/products/$slug" params={{ slug: item.product.slug }} className="shrink-0">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-32 w-24 object-cover bg-secondary"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to="/products/$slug"
                      params={{ slug: item.product.slug }}
                      className="font-medium"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size {item.size} · <span
                        className="inline-block h-2 w-2 align-middle rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                  </div>
                  <p className="text-sm">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="px-2 py-1"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="px-2 py-1"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.productId, item.size, item.color)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-border p-6">
          <p className="label-eyebrow mb-4">Order summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-medium">
              <span>Total</span>
              <span>{formatPrice(total + shipping)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="label-eyebrow mt-6 block w-full bg-foreground py-4 text-center text-background transition hover:opacity-90"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure account-based checkout
          </p>
        </aside>
      </div>
    </section>
  );
}
