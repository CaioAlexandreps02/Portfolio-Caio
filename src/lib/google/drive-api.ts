import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getStoredRefreshToken } from "@/lib/google/connection";
import { refreshAccessToken } from "@/lib/google/oauth";

export type DriveItem = {
  id: string;
  name: string;
  isFolder: boolean;
};

export async function getValidAccessToken(): Promise<string> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Google Drive não conectado. Conecte em Configurações.");
  }
  const { access_token } = await refreshAccessToken(refreshToken);
  return access_token;
}

export async function getRootFolderId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("google_drive_root_folder_id")
    .eq("id", 1)
    .maybeSingle();

  return data?.google_drive_root_folder_id ?? null;
}

export async function listDriveFolder(
  folderId: string,
  accessToken: string,
): Promise<DriveItem[]> {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType)",
    orderBy: "folder,name",
    pageSize: "200",
  });

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    throw new Error("Erro ao listar arquivos do Google Drive.");
  }

  const data = await res.json();
  return (
    data.files as { id: string; name: string; mimeType: string }[]
  ).map((f) => ({
    id: f.id,
    name: f.name,
    isFolder: f.mimeType === "application/vnd.google-apps.folder",
  }));
}

export async function makeFilePublic(
  fileId: string,
  accessToken: string,
): Promise<void> {
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );
}

export function directViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
