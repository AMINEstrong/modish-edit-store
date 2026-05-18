import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useWishlist } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const has = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 ${has ? "fill-foreground" : ""}`}
            />
          </button>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-sm">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
      </Link>
    </motion.div>
  );
}
