import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/database";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) return null;
    return data;
  } catch {
    // Supabase ainda não configurado (projeto não criado) — cai pro fallback
    return null;
  }
}
