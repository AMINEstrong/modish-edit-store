import type { CategoryTab } from "@/lib/products";
import { SHOP_CATEGORY_TABS } from "@/lib/products";

type CategoryTabsProps = {
  active: string | null;
  onChange: (category: string | null) => void;
  tabs?: CategoryTab[];
  className?: string;
};

export function CategoryTabs({
  active,
  onChange,
  tabs = SHOP_CATEGORY_TABS,
  className = "",
}: CategoryTabsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`label-eyebrow border px-4 py-2 transition-all duration-300 ease-out ${
              isActive
                ? "border-gold bg-gold text-ink"
                : "border-border hover:border-gold hover:text-gold"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
