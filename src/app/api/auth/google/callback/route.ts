import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { saveRefreshToken } from "@/lib/google/connection";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("google_oauth_state")?.value;

  const redirectTo = (query: string) =>
    NextResponse.redirect(`${origin}/admin/configuracoes?${query}`);

  if (!state || !savedState || state !== savedState) {
    return redirectTo("google_error=state_invalido");
  }
  if (!code) {
    return redirectTo("google_error=autorizacao_negada");
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    if (!tokens.refresh_token) {
      return redirectTo("google_error=sem_refresh_token");
    }
    await saveRefreshToken(tokens.refresh_token);
  } catch {
    return redirectTo("google_error=falha_na_troca");
  }

  const response = redirectTo("google_connected=1");
  response.cookies.delete("google_oauth_state");
  return response;
}
