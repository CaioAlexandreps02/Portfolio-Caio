import { NextResponse, type NextRequest } from "next/server";
import { getValidAccessToken } from "@/lib/google/drive-api";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId obrigatorio." }, { status: 400 });
  }

  try {
    const accessToken = await getValidAccessToken();
    const imageRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId,
      )}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar imagem do Google Drive." },
        { status: imageRes.status },
      );
    }

    const buffer = await imageRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erro ao buscar imagem do Drive.",
      },
      { status: 500 },
    );
  }
}
