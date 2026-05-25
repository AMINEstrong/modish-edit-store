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
    <>
      <style>{`
        @keyframes scroll-promo {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .promo-bar-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(90deg, #a020f0 0%, #9014e0 50%, #a020f0 100%);
          box-shadow: 0 4px 20px rgba(160, 32, 240, 0.3);
        }

        .promo-bar-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(160, 32, 240, 0) 0%, rgba(160, 32, 240, 0.1) 50%, rgba(160, 32, 240, 0) 100%);
          pointer-events: none;
        }

        .promo-bar-border-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }

        .promo-bar-border-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160, 32, 240, 0.3), transparent);
        }

        .promo-bar-content {
          position: relative;
          padding: 1rem 1.5rem;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .promo-bar-content {
            padding: 1rem 1.5rem;
          }
        }

        .promo-scroll {
          display: flex;
          gap: 3rem;
          will-change: transform;
        }

        .promo-scroll.animate {
          animation: scroll-promo 25s linear infinite;
        }

        .promo-scroll.no-animate {
          display: flex;
          justify-content: center;
          animation: none;
        }

        .promo-item {
          display: flex;
          align-items: center;
          white-space: nowrap;
          font-weight: 700;
          font-size: 0.9375rem;
          letter-spacing: 0.03em;
          color: white;
          flex-shrink: 0;
          min-width: max-content;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .promo-item {
            font-size: 0.8125rem;
            font-weight: 600;
          }

          .promo-scroll {
            gap: 2rem;
          }

          .promo-bar-content {
            padding: 0.875rem 1rem;
          }
        }
      `}</style>

      <div className="promo-bar-container">
        {/* Glow effect */}
        <div className="promo-bar-glow" />

        {/* Border lines */}
        <div className="promo-bar-border-top" />
        <div className="promo-bar-border-bottom" />

        {/* Content */}
        <div className="promo-bar-content">
          <div
            className={cn(
              "promo-scroll",
              !reduceMotion ? "animate" : "no-animate"
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
    </>
  );
}
