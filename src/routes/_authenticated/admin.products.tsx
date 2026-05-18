import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProducts,
});

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  gender: string;
  category: string;
  image_url: string;
  colors: string[];
  sizes: string[];
  stock: number;
};

const empty: Omit<ProductRow, "id"> = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  gender: "homme",
  category: "T-shirts",
  image_url: "",
  colors: ["#0d0d0d"],
  sizes: ["S", "M", "L"],
  stock: 0,
};

function AdminProducts() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data as ProductRow[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    refresh();
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${rows.length} product${rows.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="label-eyebrow flex items-center gap-2 bg-foreground px-4 py-2 text-background"
        >
          <Plus className="h-3 w-3" /> Add product
        </button>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.slug}</div>
                </td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3 capitalize">{p.gender}</td>
                <td className="px-4 py-3">{formatPrice(Number(p.price))}</td>
                <td className="px-4 py-3">
                  <span className={p.stock < 5 ? "text-destructive" : ""}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-secondary" aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-secondary" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

function ProductForm({
  initial, isNew, onClose, onSaved,
}: { initial: ProductRow; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        gender: form.gender,
        category: form.category.trim(),
        image_url: form.image_url.trim(),
        colors: form.colors,
        sizes: form.sizes,
        stock: Number(form.stock),
      };
      if (isNew) {
        const { error } = await supabase.from("products").insert(payload);
        if (error) return toast.error(error.message);
        toast.success("Product created");
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", initial.id);
        if (error) return toast.error(error.message);
        toast.success("Product updated");
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{isNew ? "New product" : "Edit product"}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="input" />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input" />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Price (€)">
              <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="input" />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required className="input" />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </Field>
          </div>
          <Field label="Category">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="input" />
          </Field>
          <Field label="Image URL">
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required className="input" placeholder="https://…" />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Sizes (comma separated)">
              <input
                value={form.sizes.join(", ")}
                onChange={(e) => setForm({ ...form, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="input"
              />
            </Field>
            <Field label="Colors (hex, comma separated)">
              <input
                value={form.colors.join(", ")}
                onChange={(e) => setForm({ ...form, colors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="input"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="label-eyebrow border border-border px-4 py-3">Cancel</button>
            <button type="submit" disabled={saving} className="label-eyebrow bg-foreground px-6 py-3 text-background disabled:opacity-50">
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </form>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--foreground)}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-eyebrow mb-2 block">{label}</span>
      {children}
    </label>
  );
}
