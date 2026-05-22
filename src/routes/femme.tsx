import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import hero from "@/assets/hero-femme.jpg";
import hero2x from "@/assets/hero-femme@2x.jpg";
import { HeroImage } from "@/components/HeroImage";
import { buildSrcSet } from "@/lib/hero-image";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Filters, type FilterState } from "@/components/Filters";
import { useProducts } from "@/hooks/use-products";
import { FEMME_CATEGORIES, FEMME_CATEGORY_TABS } from "@/lib/products";
import { fetchSettings } from "@/lib/settings";

export const Route = createFileRoute("/femme")({
  loader: () => fetchSettings(),
  head: () => ({
    meta: [
      { title: "Femme — Slistyle" },
      { name: "description", content: "Fluid silhouettes for women. Dresses, silk tops, skirts, heels and bags." },
      { property: "og:title", content: "Femme — Slistyle" },
      { property: "og:description", content: "Fluid silhouettes for women." },
    ],
  }),
  component: FemmePage,
});

function FemmePage() {
  const settings = Route.useLoaderData();
  const { data: all = [], isLoading } = useProducts({ gender: "femme" });
  const [filter, setFilter] = useState<FilterState>({
    category: null,
    size: null,
    color: null,
    maxPrice: 600,
  });

  const filtered = all.filter((p) => {
    if (filter.category && p.category !== filter.category) return false;
    if (filter.size && !p.sizes.includes(filter.size)) return false;
    if (filter.color && !p.colors.includes(filter.color)) return false;
    if (p.price > filter.maxPrice) return false;
    return true;
  });

  return (
    <>
      <section className="relative h-[55vh] overflow-hidden">
        <HeroImage
          src={settings?.hero_femme_url || hero}
          srcSet={
            settings?.hero_femme_url
              ? undefined
              : buildSrcSet(hero, hero2x, 1536)
          }
          alt="Femme collection"
          sizes="100vw"
          width={1536}
          height={2730}
          targetWidth={1536}
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/10 text-background">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="label-eyebrow"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif text-6xl md:text-8xl"
          >
            Femme
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[220px_1fr]">
          <Filters
            source={all}
            state={filter}
            onChange={setFilter}
            categories={FEMME_CATEGORIES}
          />
          <div>
            <CategoryTabs
              tabs={FEMME_CATEGORY_TABS}
              active={filter.category}
              onChange={(category) => setFilter({ ...filter, category })}
              className="mb-8"
            />
            <p className="label-eyebrow mb-6 text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </p>
            {isLoading ? (
              <p className="py-20 text-center text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                No pieces match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
