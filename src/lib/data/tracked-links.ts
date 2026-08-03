import { createClient } from "@/lib/supabase/server";
import type { TrackedLink } from "@/types/database";

export async function getTrackedLinks(): Promise<TrackedLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
