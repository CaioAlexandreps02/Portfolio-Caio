import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import {
  directViewUrl,
  getValidAccessToken,
  makeFilePublic,
} from "@/lib/google/drive-api";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { fileId } = await request.json();
  if (!fileId) {
    return NextResponse.json({ error: "fileId obrigatório." }, { status: 400 });
  }

  try {
    const accessToken = await getValidAccessToken();
    try {
      await makeFilePublic(fileId, accessToken);
    } catch {
      // segue mesmo se não conseguir alterar a permissão — pode precisar
      // compartilhar manualmente nesse caso raro
    }
    return NextResponse.json({ url: directViewUrl(fileId) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao selecionar arquivo." },
      { status: 500 },
    );
  }
}
