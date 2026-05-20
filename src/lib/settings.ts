import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  hero_banner_url: string | null;
  hero_homme_url: string | null;
  hero_femme_url: string | null;
  updated_at: string | null;
};

export async function fetchSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error && error.code !== "PGRST116") throw error; // ignore no rows error
  return data;
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<void> {
  const current = await fetchSettings();
  if (current) {
    const { error } = await supabase.from("site_settings").update(settings).eq("id", current.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("site_settings").insert(settings);
    if (error) throw error;
  }
}
