import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { productKeys } from "@/hooks/use-products";
import { resolveProductImage, HOMME_CATEGORIES, FEMME_CATEGORIES } from "@/lib/products";
import {
  STORAGE_SETUP_HINT,
  uploadProductImage,
  validateProductImage,
} from "@/lib/product-images";
import { slugify } from "@/lib/utils";

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
  additional_images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
};

const EMPTY_PRODUCT: ProductRow = {
  id: "",
  slug: "",
  name: "",
  description: "",
  price: 0,
  gender: "homme",
  category: "T-shirts",
  image_url: "",
  additional_images: [],
  colors: ["#0d0d0d"],
  sizes: ["S", "M", "L"],
  stock: 0,
};

function AdminProducts() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    refresh();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Article supprimé");
    refresh();
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Chargement…"
            : `${filteredRows.length} article${filteredRows.length === 1 ? "" : "s"}${search.trim() ? ` (sur ${rows.length})` : ""}`}
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="label-eyebrow flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-background"
        >
          <Plus className="h-3 w-3" /> Ajouter un article
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, slug, catégorie…"
          className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground"
        />
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Tailles / Couleurs</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.map((p) => (
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
                <td className="px-4 py-3">
                  <div className="mb-1 flex flex-wrap gap-1">
                    {p.sizes.map((s) => (
                      <span key={s} className="bg-foreground text-background px-1 py-0.5 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.colors.map((c) => (
                      <span
                        key={c}
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="p-1.5 hover:bg-secondary"
                      aria-label="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 hover:bg-secondary"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {search.trim() ? "Aucun article ne correspond à la recherche." : "Aucun article pour le moment."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing ?? EMPTY_PRODUCT}
          isNew={creating}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
          }}
        />
      )}
    </>
  );
}

function ProductForm({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: ProductRow;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew && Boolean(initial.slug));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    initial.image_url ? resolveProductImage(initial.slug, initial.image_url) : null,
  );
  
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [previewUrl2, setPreviewUrl2] = useState<string | null>(() =>
    initial.additional_images?.[0] ? resolveProductImage(initial.slug, initial.additional_images[0]) : null,
  );

  const [imageFile3, setImageFile3] = useState<File | null>(null);
  const [previewUrl3, setPreviewUrl3] = useState<string | null>(() =>
    initial.additional_images?.[1] ? resolveProductImage(initial.slug, initial.additional_images[1]) : null,
  );

  const [saving, setSaving] = useState(false);

  const onImagePick = (
    file: File | null, 
    setFile: (f: File | null) => void, 
    setPreview: (u: string | null) => void, 
    currentPreview: string | null
  ) => {
    if (!file) return;
    const err = validateProductImage(file);
    if (err) return toast.error(err);
    if (currentPreview?.startsWith("blob:")) URL.revokeObjectURL(currentPreview);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return toast.error("Le titre est requis.");

    const slug = (slugTouched ? form.slug : slugify(name) || form.slug).trim();
    if (!slug) return toast.error("L'identifiant URL est invalide.");

    setSaving(true);
    try {
      const uploadOrKeep = async (file: File | null, existingUrl: string) => {
        if (file) {
          const url = await uploadProductImage(file, slug);
          if (url.startsWith("data:")) {
            toast.warning(
              "Photo enregistrée (mode temporaire). Pour le stockage permanent, configurez Supabase Storage.",
              { description: STORAGE_SETUP_HINT, duration: 8000 },
            );
          }
          return url;
        }
        return existingUrl.trim();
      };

      const imageUrl = await uploadOrKeep(imageFile, form.image_url);
      const imageUrl2 = await uploadOrKeep(imageFile2, form.additional_images?.[0] || "");
      const imageUrl3 = await uploadOrKeep(imageFile3, form.additional_images?.[1] || "");

      if (isNew && !imageUrl) {
        toast.error("Ajoutez une photo principale du produit.");
        setSaving(false);
        return;
      }

      const payload = {
        slug,
        name,
        description: form.description.trim(),
        price: Number(form.price),
        gender: form.gender,
        category: form.category.trim(),
        image_url: imageUrl,
        additional_images: [imageUrl2, imageUrl3].filter(Boolean),
        colors: form.colors,
        sizes: form.sizes,
        stock: Number(form.stock),
      };

      if (isNew) {
        const { error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Article créé");
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initial.id)
          .select("id")
          .single();
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Article enregistré");
      }

      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col bg-background">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-6">
          <h2 className="font-serif text-2xl">{isNew ? "Nouvel article" : "Modifier l'article"}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
            <Field label="Titre">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
                placeholder="Ex. Robe en soie"
              />
            </Field>
            <Field label="Identifiant URL (optionnel)">
              <input
                value={slugTouched ? form.slug : ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
                className="input"
                placeholder={slugify(form.name) || "genere-automatiquement-depuis-le-titre"}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Laissez vide pour générer automatiquement à partir du titre.
              </p>
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="input"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Prix (MAD)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                  className="input"
                />
              </Field>
              <Field label="Stock">
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                  className="input"
                />
              </Field>
              <Field label="Genre">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input"
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </Field>
            </div>
            <Field label="Catégorie">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="input"
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {(form.gender === "homme" ? HOMME_CATEGORIES : FEMME_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Photos du produit (jusqu'à 3)">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Image principale */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Principale</p>
                  {previewUrl && (
                    <div className="aspect-[4/5] w-full overflow-hidden border border-border bg-secondary">
                      <img src={previewUrl} alt="Aperçu 1" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => onImagePick(e.target.files?.[0] ?? null, setImageFile, setPreviewUrl, previewUrl)}
                    className="input file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background text-xs"
                  />
                </div>

                {/* Image optionnelle 1 */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Optionnelle 1</p>
                  {previewUrl2 && (
                    <div className="aspect-[4/5] w-full overflow-hidden border border-border bg-secondary">
                      <img src={previewUrl2} alt="Aperçu 2" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => onImagePick(e.target.files?.[0] ?? null, setImageFile2, setPreviewUrl2, previewUrl2)}
                    className="input file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background text-xs"
                  />
                </div>

                {/* Image optionnelle 2 */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Optionnelle 2</p>
                  {previewUrl3 && (
                    <div className="aspect-[4/5] w-full overflow-hidden border border-border bg-secondary">
                      <img src={previewUrl3} alt="Aperçu 3" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => onImagePick(e.target.files?.[0] ?? null, setImageFile3, setPreviewUrl3, previewUrl3)}
                    className="input file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background text-xs"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                JPEG, PNG, WebP ou GIF — max. 5 Mo par image. {isNew ? "Principale obligatoire." : "Laissez vide pour conserver."}
              </p>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tailles (séparées par des virgules)">
                <input
                  value={form.sizes.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="input"
                />
              </Field>
              <Field label="Couleurs (hex, séparées par des virgules)">
                <input
                  value={form.colors.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      colors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="input"
                />
              </Field>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-8 py-4">
            <button
              type="button"
              onClick={onClose}
              className="label-eyebrow border border-border px-4 py-3"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="label-eyebrow min-w-[140px] bg-foreground px-6 py-3 text-background disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : isNew ? "Créer" : "Enregistrer"}
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


