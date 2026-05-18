import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import hommeImg from "@/assets/hero-homme.jpg";
import femmeImg from "@/assets/hero-femme.jpg";
import bannerImg from "@/assets/hero-banner.jpg";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slistyle — Autumn / Winter Collection" },
      { name: "description", content: "Discover the new season. Minimal, elevated essentials for men and women." },
      { property: "og:title", content: "Slistyle — Autumn / Winter Collection" },
      { property: "og:description", content: "Discover the new season. Minimal, elevated essentials for men and women." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <img
          src={bannerImg}
          alt="Slistyle Autumn Winter campaign"
          width={1920}
          height={1080}
          className="h-[80vh] w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="label-eyebrow text-background"
          >
            Autumn / Winter 26
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="font-serif text-5xl text-background md:text-7xl"
          >
            A quieter season.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 flex gap-3"
          >
            <Link
              to="/femme"
              className="label-eyebrow border border-background bg-background px-6 py-3 text-foreground transition hover:bg-transparent hover:text-background"
            >
              Shop Femme
            </Link>
            <Link
              to="/homme"
              className="label-eyebrow border border-background px-6 py-3 text-background transition hover:bg-background hover:text-foreground"
            >
              Shop Homme
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Split categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { to: "/homme" as const, img: hommeImg, label: "Homme", subtitle: "Tailored essentials" },
            { to: "/femme" as const, img: femmeImg, label: "Femme", subtitle: "Fluid silhouettes" },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={c.to} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={c.img}
                    alt={c.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute bottom-8 left-8 text-background">
                    <p className="label-eyebrow">{c.subtitle}</p>
                    <p className="mt-2 font-serif text-5xl">{c.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="label-eyebrow text-muted-foreground">The Edit</p>
            <h2 className="mt-2 font-serif text-4xl">New arrivals</h2>
          </div>
          <Link to="/femme" className="label-eyebrow underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Editorial strip */}
      <section className="border-y border-border bg-secondary/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="label-eyebrow text-muted-foreground">The Atelier</p>
          <p className="mt-6 font-serif text-3xl leading-relaxed md:text-4xl">
            "We design fewer things, made better. Garments that earn their place in your life
            and stay there."
          </p>
          <p className="mt-6 label-eyebrow">— The Studio</p>
        </div>
      </section>
    </>
  );
}
