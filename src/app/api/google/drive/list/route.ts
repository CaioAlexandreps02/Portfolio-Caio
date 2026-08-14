import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import {
  getRootFolderId,
  getValidAccessToken,
  listDriveFolder,
} from "@/lib/google/drive-api";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const requestedFolderId = request.nextUrl.searchParams.get("folderId");
  const folderId = requestedFolderId ?? (await getRootFolderId());

  if (!folderId) {
    return NextResponse.json(
      {
        error:
          "Nenhuma pasta raiz configurada. Defina uma em Configurações.",
      },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getValidAccessToken();
    const items = await listDriveFolder(folderId, accessToken);
    return NextResponse.json({ folderId, items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar pasta." },
      { status: 500 },
    );
  }
}
