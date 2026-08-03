"use server";

import { createClient } from "@/lib/supabase/server";

export type TrackedLinkPayload = {
  code: string;
  label: string;
  destination_url: string;
  project_id: string | null;
};

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado.");
  return supabase;
}

export async function createTrackedLink(payload: TrackedLinkPayload) {
  const supabase = await requireUser();

  const { error } = await supabase.from("tracked_links").insert(payload);
  if (error) throw new Error(error.message);
}

export async function updateTrackedLink(
  id: string,
  payload: TrackedLinkPayload,
) {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("tracked_links")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTrackedLink(id: string) {
  const supabase = await requireUser();

  const { error } = await supabase.from("tracked_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
