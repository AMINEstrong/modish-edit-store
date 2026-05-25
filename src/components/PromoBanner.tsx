interface PromoItem {
  text: string;
  icon: string;
  badge?: string;
}

const promoItems: PromoItem[] = [
  { text: "LIVRAISON GRATUITE À PARTIR DE 0 DH", icon: "🚚", badge: "OFFERT" },
  { text: "PROMOTION -20%", icon: "🔥", badge: "BEST" },
  { text: "OFFRES LIMITÉES", icon: "✨" },
  { text: "ACHETEZ MAINTENANT", icon: "🛍️" },
];

// Repeat items to fill wide displays seamlessly
const repeatedItems = [...promoItems, ...promoItems, ...promoItems, ...promoItems];

export function PromoBanner() {
  return (
    <div 
      className="relative w-full overflow-hidden bg-gradient-to-r from-[#4c1d95] via-[#a020f0] to-[#6d28d9] py-2 md:py-2.5 text-white border-b border-[#c9a962]/20 shadow-[0_4px_15px_rgba(160,32,240,0.15)] z-40 select-none group/banner"
      role="region"
      aria-label="Promotions"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {/* Group 1 */}
          <div className="flex items-center gap-12 md:gap-16 pr-12 md:pr-16">
            {repeatedItems.map((item, idx) => (
              <div 
                key={`g1-${idx}`} 
                className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:text-[#c9a962] cursor-pointer"
              >
                <span className="text-sm md:text-base animate-pulse">{item.icon}</span>
                <span className="font-sans text-white/95 hover:text-white transition-colors duration-300">
                  {item.text}
                </span>
                {item.badge && (
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[8px] font-extrabold tracking-normal text-white/90 border border-white/10 shadow-sm">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#c9a962]/40 text-[8px] md:text-[10px] pl-6 md:pl-8 font-light">◆</span>
              </div>
            ))}
          </div>

          {/* Group 2 (identical for seamless infinite scrolling) */}
          <div className="flex items-center gap-12 md:gap-16 pr-12 md:pr-16">
            {repeatedItems.map((item, idx) => (
              <div 
                key={`g2-${idx}`} 
                className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:text-[#c9a962] cursor-pointer"
              >
                <span className="text-sm md:text-base animate-pulse">{item.icon}</span>
                <span className="font-sans text-white/95 hover:text-white transition-colors duration-300">
                  {item.text}
                </span>
                {item.badge && (
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[8px] font-extrabold tracking-normal text-white/90 border border-white/10 shadow-sm">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#c9a962]/40 text-[8px] md:text-[10px] pl-6 md:pl-8 font-light">◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
