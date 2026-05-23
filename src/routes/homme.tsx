import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import hero from "@/assets/hero-homme.jpg";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Filters, type FilterState } from "@/components/Filters";
import { fadeIn, heroTransition } from "@/lib/motion";
import { useProducts } from "@/hooks/use-products";
import { HOMME_CATEGORIES, HOMME_CATEGORY_TABS } from "@/lib/products";
import { fetchSettings } from "@/lib/settings";

export const Route = createFileRoute("/homme")({
  loader: () => fetchSettings(),
  head: () => ({
    meta: [
      { title: "Homme — Slistyle" },
      { name: "description", content: "Street luxury essentials for men." },
      { property: "og:title", content: "Homme — Slistyle" },
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
      <HeroBanner
        src={settings?.hero_homme_url || hero}
        alt="Homme collection"
        variant="homme"
        minHeight="min-h-[55vh] md:min-h-[60vh]"
        contentClassName="items-center justify-center text-center"
      >
        <motion.p
          initial={fadeIn.hidden}
          animate={fadeIn.visible}
          transition={heroTransition}
          className="label-eyebrow text-gold"
        >
          Collection
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.1 }}
          className="font-display mt-4 text-6xl text-white md:text-8xl"
        >
          Homme
        </motion.h1>
      </HeroBanner>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3">
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
