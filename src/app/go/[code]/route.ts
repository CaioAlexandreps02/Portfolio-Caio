import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const supabase = createServiceClient();

  const { data: link } = await supabase
    .from("tracked_links")
    .select("id, destination_url, click_count")
    .eq("code", code)
    .single();

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await supabase
    .from("tracked_links")
    .update({ click_count: link.click_count + 1 })
    .eq("id", link.id);

  return NextResponse.redirect(link.destination_url);
}
