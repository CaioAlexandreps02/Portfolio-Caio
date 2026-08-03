"use server";

import { createClient } from "@/lib/supabase/server";

export type SiteSettingsPayload = {
  about_bio: string | null;
  about_photo_url: string | null;
  whatsapp_number: string | null;
  linkedin_url: string | null;
  email: string | null;
};

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado.");
  return supabase;
}

export async function updateSiteSettings(payload: SiteSettingsPayload) {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1);

  if (error) throw new Error(error.message);
}

export async function updateFeaturedOrder(orderedIds: string[]) {
  const supabase = await requireUser();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("projects").update({ sort_order: index }).eq("id", id),
    ),
  );
}
