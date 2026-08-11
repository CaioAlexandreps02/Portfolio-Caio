import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export async function getStoredRefreshToken(): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("google_drive_connection")
    .select("refresh_token")
    .eq("id", 1)
    .maybeSingle();

  return data?.refresh_token ?? null;
}

export async function getGoogleDriveConnectionStatus(): Promise<{
  connected: boolean;
  connectedAt: string | null;
}> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("google_drive_connection")
    .select("refresh_token, connected_at")
    .eq("id", 1)
    .maybeSingle();

  return {
    connected: Boolean(data?.refresh_token),
    connectedAt: data?.connected_at ?? null,
  };
}

export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("google_drive_connection").upsert({
    id: 1,
    refresh_token: refreshToken,
    connected_at: new Date().toISOString(),
  });
}

export async function clearGoogleDriveConnection(): Promise<string | null> {
  const supabase = createServiceClient();
  const previous = await getStoredRefreshToken();
  await supabase.from("google_drive_connection").upsert({
    id: 1,
    refresh_token: null,
    connected_at: null,
  });
  return previous;
}
