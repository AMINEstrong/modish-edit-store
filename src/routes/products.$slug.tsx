import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { fetchProductBySlug, fetchProducts } from "@/lib/products";
import { useCart, useWishlist } from "@/lib/store";
import { resolveLineOptions } from "@/lib/cart-line";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    const catalog = await fetchProducts({ gender: product.gender });
    const related = catalog.filter((p) => p.id !== product.id).slice(0, 4);
    return { product, related };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Slistyle` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Slistyle` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
          { property: "twitter:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl">Piece not found</h1>
        <Link to="/" className="label-eyebrow mt-4 inline-block underline underline-offset-4">
          Back to home
        </Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const inWish = useWishlist((s) => s.ids.includes(product.id));

  const images = [product.image, ...(product.additionalImages || [])].filter(Boolean);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="group relative aspect-[4/5] w-full overflow-hidden bg-secondary"
        >
          <div className="h-full overflow-hidden" ref={emblaRef}>
            <div className="flex h-full touch-pan-y">
              {images.map((img, i) => (
                <div key={img} className="min-w-0 flex-[0_0_100%]">
                  <img
                    src={img}
                    alt={`${product.name} - Vue ${i + 1}`}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {images.length > 1 && (
            <>
              {/* Flèches */}
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedIndex ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40 hover:bg-foreground/60"
                    }`}
                    aria-label={`Aller à l'image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:py-8"
        >
          <Link
            to={product.gender === "homme" ? "/homme" : "/femme"}
            className="label-eyebrow text-muted-foreground hover:text-foreground"
          >
            {product.gender === "homme" ? "Homme" : "Femme"} / {product.category}
          </Link>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(product.price)}</p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="label-eyebrow mb-3">Colour</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border transition ${
                    color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                  }`}
                  style={{ backgroundColor: c, borderColor: "var(--border)" }}
                  aria-label={`Colour ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="label-eyebrow">Size</p>
              <button className="text-xs underline underline-offset-4 text-muted-foreground">
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 border px-3 py-2 text-sm transition ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2"
                aria-label="Decrease"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2"
                aria-label="Increase"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {product.stock} in stock
            </p>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => {
                if (product.sizes.length > 0 && !size) {
                  toast.error("Choisissez une taille.");
                  return;
                }
                if (product.colors.length > 0 && !color) {
                  toast.error("Choisissez une couleur.");
                  return;
                }
                const line = resolveLineOptions(product, size, color);
                add({
                  productId: product.id,
                  size: line.size,
                  color: line.color,
                  quantity: qty,
                  product,
                });
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              className="label-eyebrow flex-1 bg-foreground py-4 text-background transition hover:opacity-90"
            >
              {added ? "Added to bag" : "Add to bag"}
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              className="flex h-[52px] w-[52px] items-center justify-center border border-foreground transition hover:bg-foreground hover:text-background"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${inWish ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="mt-10 space-y-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>Livraison gratuite à partir de {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
            <p>Complimentary returns within 30 days</p>
            <p>Crafted in our European atelier</p>
          </div>
        </motion.div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="mb-8 font-serif text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
