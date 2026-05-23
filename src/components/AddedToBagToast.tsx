import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCartNotification } from "@/lib/cart-notification";
import { easeOut } from "@/lib/motion";

const AUTO_DISMISS_MS = 3000;

export function AddedToBagToast() {
  const { open, productName, dismiss } = useCartNotification();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!open) return;

    timerRef.current = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, productName, dismiss]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end sm:p-0"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key={productName}
            role="status"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-gold/25 bg-ink shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]"
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <Check className="h-5 w-5 text-gold" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="label-eyebrow text-gold">Panier</p>
                  <p className="mt-1 font-display text-lg leading-snug tracking-wide text-white">
                    Product successfully added
                  </p>
                  {productName && (
                    <p className="mt-1 truncate text-sm text-white/65">{productName}</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Link
                  to="/cart"
                  onClick={dismiss}
                  className="label-eyebrow flex flex-1 items-center justify-center rounded-lg border border-gold bg-gold px-4 py-3 text-ink transition-all duration-300 ease-out hover:bg-transparent hover:text-gold"
                >
                  Voir le panier
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="label-eyebrow flex flex-1 items-center justify-center rounded-lg border border-white/25 bg-transparent px-4 py-3 text-white transition-all duration-300 ease-out hover:border-white hover:bg-white/10"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
