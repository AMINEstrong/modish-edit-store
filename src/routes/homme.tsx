import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import hero from "@/assets/hero-homme.jpg";
import hero2x from "@/assets/hero-homme@2x.jpg";
import { HeroImage } from "@/components/HeroImage";
import { buildSrcSet } from "@/lib/hero-image";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Filters, type FilterState } from "@/components/Filters";
import { useProducts } from "@/hooks/use-products";
import { HOMME_CATEGORIES, HOMME_CATEGORY_TABS } from "@/lib/products";
import { fetchSettings } from "@/lib/settings";

export const Route = createFileRoute("/homme")({
  loader: () => fetchSettings(),
  head: () => ({
    meta: [
      { title: "Homme — Slistyle" },
      { name: "description", content: "Tailored essentials for men. Coats, knitwear, denim and shoes." },
      { property: "og:title", content: "Homme — Slistyle" },
      { property: "og:description", content: "Tailored essentials for men." },
    ],
  }),
  component: HommePage,
});

function HommePage() {
  const settings = Route.useLoaderData();
  const { data: all = [], isLoading } = useProducts({ gender: "homme" });
  const [filter, setFilter] = useState<FilterState>({
    category: null,
    size: null,
    color: null,
    maxPrice: 800,
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
          src={settings?.hero_homme_url || hero}
          srcSet={
            settings?.hero_homme_url
              ? undefined
              : buildSrcSet(hero, hero2x)
          }
          alt="Homme collection"
          sizes="100vw"
          width={2560}
          height={1440}
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
            Homme
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[220px_1fr]">
          <Filters
            source={all}
            state={filter}
            onChange={setFilter}
            categories={HOMME_CATEGORIES}
          />
          <div>
            <CategoryTabs
              tabs={HOMME_CATEGORY_TABS}
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
