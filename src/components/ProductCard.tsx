import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useWishlist } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { defaultTransition, fadeInUp } from "@/lib/motion";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const has = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay: (index % 10) * 0.05 }}
      className="group"
    >
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="image-hover-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-black/60"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 transition-colors ${has ? "fill-gold text-gold" : ""}`} />
          </button>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium tracking-wide transition-colors group-hover:text-gold">
            {product.name}
          </h3>
          <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</p>
        </div>
        <p className="label-eyebrow mt-1 text-muted-foreground">{product.category}</p>
      </Link>
    </motion.div>
  );
}
