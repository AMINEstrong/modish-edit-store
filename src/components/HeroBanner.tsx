import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { HeroImage } from "@/components/HeroImage";
import { HERO_SIZE, type HeroVariant } from "@/lib/hero-image";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HeroBannerProps = {
  src: string;
  alt: string;
  children: ReactNode;
  variant?: HeroVariant;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
  priority?: boolean;
};

export function HeroBanner({
  src,
  alt,
  children,
  variant = "banner",
  className,
  contentClassName,
  minHeight = "min-h-[88vh] md:min-h-[92vh]",
  priority = true,
}: HeroBannerProps) {
  const reduceMotion = useReducedMotion();
  const spec = HERO_SIZE[variant];

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden bg-ink", minHeight, className)}
    >
      {/* Fixed-fill background — not in document flow */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <motion.div
          className="absolute inset-0 h-full w-full"
          initial={reduceMotion ? false : { scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: easeOut }}
        >
          <motion.div
            className="h-full w-full"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.035, 1] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 22, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <HeroImage
              src={src}
              alt={alt}
              width={spec.width}
              height={spec.height}
              targetWidth={spec.targetWidth}
              sizes="100vw"
              priority={priority}
              className="h-full min-h-full w-full min-w-full object-cover object-center"
            />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>

      <div
        className={cn(
          "relative z-10 flex min-h-[inherit] flex-col justify-end px-6 pb-14 pt-28 md:px-10 md:pb-20",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
