import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import hommeImg from "@/assets/hero-homme.jpg";
import femmeImg from "@/assets/hero-femme.jpg";
import bannerImg from "@/assets/hero-banner.jpg";
import { HeroBanner } from "@/components/HeroBanner";
import { HeroImage } from "@/components/HeroImage";
import { CategoryTabs } from "@/components/CategoryTabs";
import { HERO_SIZE } from "@/lib/hero-image";
import { fadeIn, heroTransition, staggerContainer } from "@/lib/motion";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useProducts } from "@/hooks/use-products";
import { fetchSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  loader: () => fetchSettings(),
  head: () => ({
    meta: [
      { title: "Slistyle — Street Luxury" },
      { name: "description", content: "Minimal streetwear essentials. Elevated fits for men and women." },
      { property: "og:title", content: "Slistyle — Street Luxury" },
      { property: "og:description", content: "Minimal streetwear essentials." },
    ],
  }),
  component: Home,
});

function Home() {
  const settings = Route.useLoaderData();
  const { data: products = [], isLoading } = useProducts();
  const [category, setCategory] = useState<string | null>(null);

  const displayed = useMemo(() => {
    const list = category
      ? products.filter((p) => p.category === category)
      : products;
    return list;
  }, [products, category]);

  const finalBanner = settings?.hero_banner_url || bannerImg;
  const finalHomme = settings?.hero_homme_url || hommeImg;
  const finalFemme = settings?.hero_femme_url || femmeImg;

  return (
    <>
      <HeroBanner src={finalBanner} alt="Slistyle collection" variant="banner">
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeIn}
            transition={heroTransition}
            className="label-eyebrow text-gold"
          >
            Spring / Summer 26
          </motion.p>
          <motion.div
            variants={fadeIn}
            transition={{ ...heroTransition, delay: 0.08 }}
            className="gold-accent-line mx-auto mt-4"
          />
          <motion.h1
            variants={fadeIn}
            transition={{ ...heroTransition, delay: 0.12 }}
            className="font-display mt-6 text-5xl leading-[1.05] text-white md:text-7xl lg:text-8xl"
          >
            Street luxury.
            <span className="mt-2 block text-3xl font-normal tracking-[0.2em] text-white/90 md:text-4xl">
              Defined.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            transition={{ ...heroTransition, delay: 0.2 }}
            className="mt-5 max-w-md text-sm font-light tracking-wide text-white/75"
          >
            Minimal silhouettes. Premium materials. Built for the city.
          </motion.p>
          <motion.div
            variants={fadeIn}
            transition={{ ...heroTransition, delay: 0.28 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/femme" className="btn-hero-primary">
              Shop Femme
            </Link>
            <Link to="/homme" className="btn-hero-outline">
              Shop Homme
            </Link>
          </motion.div>
        </motion.div>
      </HeroBanner>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <ScrollReveal className="mb-12 text-center md:mb-16">
          <p className="label-eyebrow text-gold">Collections</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl">Choose your lane</h2>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              to: "/homme" as const,
              img: finalHomme,
              label: "Homme",
              subtitle: "Tailored street",
              spec: HERO_SIZE.homme,
            },
            {
              to: "/femme" as const,
              img: finalFemme,
              label: "Femme",
              subtitle: "Fluid lines",
              spec: HERO_SIZE.femmeCard,
            },
          ].map((c, i) => (
            <ScrollReveal key={c.label} delay={i * 0.1}>
              <Link to={c.to} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-ink">
                  <HeroImage
                    src={c.img}
                    alt={c.label}
                    width={c.spec.width}
                    height={c.spec.height}
                    targetWidth={c.spec.targetWidth}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="image-hover-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="label-eyebrow text-gold">{c.subtitle}</p>
                    <p className="font-display mt-2 text-5xl tracking-wide">{c.label}</p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <ScrollReveal>
          <p className="label-eyebrow text-gold">The Edit</p>
          <h2 className="font-display mt-2 text-4xl md:text-5xl">New arrivals</h2>
        </ScrollReveal>
        <CategoryTabs active={category} onChange={setCategory} className="mb-10 mt-8" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading ? (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : displayed.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No pieces in this category yet.{" "}
              <Link to="/homme" className="text-gold underline underline-offset-4">
                Browse collections
              </Link>
            </p>
          ) : (
            displayed.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))
          )}
        </div>
      </section>

      <section className="border-y border-border bg-ink py-24 text-paper md:py-32">
        <ScrollReveal className="mx-auto max-w-3xl px-6 text-center">
          <p className="label-eyebrow text-gold">The Atelier</p>
          <div className="gold-accent-line mx-auto mt-4" />
          <p className="font-display mt-8 text-3xl leading-relaxed md:text-4xl">
            Fewer pieces. Sharper fits. Garments that move with you — and stay.
          </p>
          <p className="label-eyebrow mt-8 text-white/60">— SLISTYLE Studio</p>
        </ScrollReveal>
      </section>
    </>
  );
}
