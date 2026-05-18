import { useMemo } from "react";
import type { Product } from "@/lib/products";

export type FilterState = {
  category: string | null;
  size: string | null;
  color: string | null;
  maxPrice: number;
};

export function Filters({
  source,
  state,
  onChange,
  categories,
}: {
  source: Product[];
  state: FilterState;
  onChange: (s: FilterState) => void;
  categories: readonly string[];
}) {
  const sizes = useMemo(() => {
    const s = new Set<string>();
    source.forEach((p) => p.sizes.forEach((x) => s.add(x)));
    return Array.from(s);
  }, [source]);

  const colors = useMemo(() => {
    const c = new Set<string>();
    source.forEach((p) => p.colors.forEach((x) => c.add(x)));
    return Array.from(c);
  }, [source]);

  const maxPrice = useMemo(
    () => Math.max(600, ...source.map((p) => p.price)),
    [source],
  );

  return (
    <aside className="space-y-8 text-sm">
      <div>
        <p className="label-eyebrow mb-3">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => onChange({ ...state, category: null })}
            className={`block transition ${state.category === null ? "underline underline-offset-4" : "opacity-70 hover:opacity-100"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...state, category: c })}
              className={`block transition ${state.category === c ? "underline underline-offset-4" : "opacity-70 hover:opacity-100"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-eyebrow mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...state, size: state.size === s ? null : s })}
              className={`min-w-9 border px-2 py-1 text-xs transition ${
                state.size === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-eyebrow mb-3">Colour</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...state, color: state.color === c ? null : c })}
              className={`h-7 w-7 rounded-full border transition ${
                state.color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
              }`}
              style={{ backgroundColor: c, borderColor: "var(--border)" }}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="label-eyebrow">Price</p>
          <span className="text-xs text-muted-foreground">up to €{state.maxPrice}</span>
        </div>
        <input
          type="range"
          min={50}
          max={maxPrice}
          step={10}
          value={state.maxPrice}
          onChange={(e) => onChange({ ...state, maxPrice: Number(e.target.value) })}
          className="w-full accent-foreground"
        />
      </div>

      <button
        onClick={() => onChange({ category: null, size: null, color: null, maxPrice })}
        className="label-eyebrow underline underline-offset-4"
      >
        Reset filters
      </button>
    </aside>
  );
}
