import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Recherche — Slistyle" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(q ?? "");
  const term = (q ?? "").trim();
  const { data: products = [], isLoading } = useProducts(
    term ? { search: term } : undefined,
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: input.trim() } });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-5xl">Recherche</h1>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nom, catégorie…"
          className="flex-1 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
          autoFocus
        />
        <button
          type="submit"
          className="label-eyebrow shrink-0 bg-foreground px-6 py-3 text-background"
        >
          Chercher
        </button>
      </form>

      {term && (
        <p className="label-eyebrow mt-8 text-muted-foreground">
          {isLoading
            ? "Chargement…"
            : `${products.length} résultat${products.length === 1 ? "" : "s"} pour « ${term} »`}
        </p>
      )}

      {!term ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Saisissez un mot-clé pour trouver un article.
        </p>
      ) : isLoading ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Aucun article trouvé.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
