import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSettings, updateSettings, type SiteSettings } from "@/lib/settings";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/product-images";
import {
  heroDimensionWarning,
  readImageDimensions,
  resolveHeroImageUrl,
} from "@/lib/hero-image";
import { Trash } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (
    file: File | null,
    key: keyof SiteSettings,
    label: string,
    kind: "banner" | "landscape" | "portrait",
  ) => {
    if (!file) return;
    setSaving(true);
    try {
      const dims = await readImageDimensions(file);
      const warn = heroDimensionWarning(file, dims, kind);
      if (warn) toast.warning(warn);

      const url = await uploadProductImage(file, `site-settings-${key}`);
      const newSettings = { ...settings, [key]: url };
      await updateSettings(newSettings);
      setSettings(newSettings);
      toast.success(`${label} mise à jour`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: keyof SiteSettings, label: string) => {
    setSaving(true);
    try {
      const newSettings = { ...settings, [key]: null };
      await updateSettings(newSettings);
      setSettings(newSettings);
      toast.success(`${label} réinitialisée`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-20 text-center">Loading settings…</p>;

  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="mb-8 font-serif text-3xl">Paramètres du site</h1>
      <p className="mb-12 text-muted-foreground">
        Gérez les grandes images d&apos;arrière-plan. Format par défaut : 1920×1080 px (paysage) pour l&apos;accueil et homme ; femme en portrait ≥ 1920 px de large.
      </p>

      <div className="space-y-12">
        <SettingImage
          label="Bannière Accueil (Hero Banner)"
          description="Paysage 1920×1080 px (défaut). Poids max : 5 Mo."
          imageUrl={settings.hero_banner_url}
          onUpload={(f) => handleUpload(f, "hero_banner_url", "Bannière Accueil", "banner")}
          onDelete={() => handleDelete("hero_banner_url", "Bannière Accueil")}
          saving={saving}
          aspect="aspect-[16/9]"
        />

        <SettingImage
          label="Bannière Collection Homme"
          description="Paysage 1920×1080 px (défaut). Poids max : 5 Mo."
          imageUrl={settings.hero_homme_url}
          onUpload={(f) => handleUpload(f, "hero_homme_url", "Bannière Homme", "landscape")}
          onDelete={() => handleDelete("hero_homme_url", "Bannière Homme")}
          saving={saving}
          aspect="aspect-[3/4] md:max-w-md"
        />

        <SettingImage
          label="Bannière Collection Femme"
          description="Portrait ou paysage 1920 px de large minimum (ex. 1920×1080). Poids max : 5 Mo."
          imageUrl={settings.hero_femme_url}
          onUpload={(f) => handleUpload(f, "hero_femme_url", "Bannière Femme", "portrait")}
          onDelete={() => handleDelete("hero_femme_url", "Bannière Femme")}
          saving={saving}
          aspect="aspect-[3/4] md:max-w-md"
        />
      </div>
    </div>
  );
}

function SettingImage({
  label,
  description,
  imageUrl,
  onUpload,
  onDelete,
  saving,
  aspect,
}: {
  label: string;
  description: string;
  imageUrl?: string | null;
  onUpload: (f: File | null) => void;
  onDelete: () => void;
  saving: boolean;
  aspect: string;
}) {
  return (
    <div className="border border-border p-6">
      <h2 className="label-eyebrow mb-2">{label}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className={`w-full overflow-hidden bg-secondary ${aspect} border border-border`}>
          {imageUrl ? (
            <img
              src={resolveHeroImageUrl(imageUrl, 1920)}
              alt={label}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground text-center p-4">
              Image par défaut<br />(ou aucune image)
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
            disabled={saving}
            className="input file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background"
          />
          {imageUrl && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="label-eyebrow flex items-center gap-2 text-destructive hover:opacity-80 transition-opacity"
              title="Supprimer cette image et remettre celle par défaut"
            >
              <Trash className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
