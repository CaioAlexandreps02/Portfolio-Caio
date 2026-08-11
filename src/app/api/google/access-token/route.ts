import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import { getStoredRefreshToken } from "@/lib/google/connection";
import { refreshAccessToken } from "@/lib/google/oauth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    return NextResponse.json(
      { error: "Google Drive não conectado. Conecte em Configurações." },
      { status: 400 },
    );
  }

  try {
    const { access_token } = await refreshAccessToken(refreshToken);
    return NextResponse.json({ access_token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao renovar token." },
      { status: 500 },
    );
  }
}
