import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PROMO_MESSAGES = [
  "🚚 LIVRAISON GRATUITE À PARTIR DE 0 DH",
  "🔥 PROMOTION -20%",
  "✨ OFFRES LIMITÉES",
  "🛍️ ACHETEZ MAINTENANT",
];

export function PromoBar() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-300/10 to-purple-500/0 pointer-events-none" />

      {/* Border line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

      {/* Content */}
      <div className="relative py-3 px-6 md:py-4 overflow-hidden">
        <style>{`
          @keyframes scroll-left {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }

          @keyframes scroll-left-mobile {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }

          .promo-scroll {
            display: flex;
            gap: 3rem;
            will-change: transform;
          }

          .promo-scroll.animate {
            animation: scroll-left 20s linear infinite;
          }

          .promo-scroll.animate-mobile {
            animation: scroll-left-mobile 15s linear infinite;
          }

          .promo-scroll.no-animate {
            display: flex;
            justify-center;
          }

          .promo-item {
            display: flex;
            align-items: center;
            white-space: nowrap;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
            text-white;
            flex-shrink: 0;
            min-width: max-content;
          }

          @media (max-width: 768px) {
            .promo-item {
              font-size: 0.8125rem;
            }

            .promo-scroll {
              gap: 2rem;
            }
          }
        `}</style>

        <div
          className={cn(
            "promo-scroll",
            !reduceMotion && "animate",
          )}
        >
          {/* First set */}
          {PROMO_MESSAGES.map((msg, idx) => (
            <div key={`first-${idx}`} className="promo-item">
              {msg}
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {PROMO_MESSAGES.map((msg, idx) => (
            <div key={`second-${idx}`} className="promo-item">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
