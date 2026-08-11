"use server";

import { createClient } from "@/lib/supabase/server";
import { clearGoogleDriveConnection } from "@/lib/google/connection";
import { revokeGoogleToken } from "@/lib/google/oauth";

export async function disconnectGoogleDrive() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado.");

  const previousToken = await clearGoogleDriveConnection();
  if (previousToken) {
    await revokeGoogleToken(previousToken);
  }
}
