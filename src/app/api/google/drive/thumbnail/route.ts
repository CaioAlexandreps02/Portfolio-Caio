import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import { getValidAccessToken } from "@/lib/google/drive-api";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId obrigatório." }, { status: 400 });
  }

  try {
    const accessToken = await getValidAccessToken();

    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const meta = await metaRes.json();
    if (!metaRes.ok || !meta.thumbnailLink) {
      return NextResponse.json({ error: "Sem miniatura." }, { status: 404 });
    }

    const imgRes = await fetch(meta.thumbnailLink, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar miniatura." },
        { status: 502 },
      );
    }

    const buffer = await imgRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": imgRes.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar miniatura." },
      { status: 500 },
    );
  }
}
