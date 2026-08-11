import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import { buildGoogleAuthUrl } from "@/lib/google/oauth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(state, origin));
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return response;
}
