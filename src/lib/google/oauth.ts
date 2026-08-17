import "server-only";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

const SCOPE = "https://www.googleapis.com/auth/drive";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada.`);
  return value;
}

/**
 * O redirect_uri precisa bater exatamente com a origem real da requisição
 * (localhost em dev, o domínio de produção quando publicado) — por isso
 * recebe `origin` em vez de usar uma URL fixa. As duas origens precisam
 * estar cadastradas em "Authorized redirect URIs" no Google Cloud Console.
 */
export function getGoogleRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string, origin: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
    redirect_uri: getGoogleRedirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: string;
  error_description?: string;
};

export async function exchangeCodeForTokens(
  code: string,
  origin: string,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(origin),
    }),
  });

  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error_description ?? "Falha ao trocar código por tokens.");
  }
  return data;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(
      data.error_description ?? "Falha ao renovar o token de acesso.",
    );
  }
  return data;
}

export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await fetch(`${REVOKE_ENDPOINT}?token=${encodeURIComponent(token)}`, {
      method: "POST",
    });
  } catch {
    // não bloqueia a desconexão local se a revogação remota falhar
  }
}
