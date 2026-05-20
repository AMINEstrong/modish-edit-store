import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "@/lib/store";
import { useProductsByIds } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Slistyle" },
      { name: "description", content: "Pieces saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const { data: items = [], isLoading } = useProductsByIds(ids);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-5xl">Wishlist</h1>
      <p className="label-eyebrow mt-2 text-muted-foreground">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"}
      </p>

      {isLoading ? (
        <p className="py-24 text-center text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Tap the heart on any piece you love.
          </p>
          <Link
            to="/"
            className="label-eyebrow mt-6 inline-block underline underline-offset-4"
          >
            Continue browsing
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
