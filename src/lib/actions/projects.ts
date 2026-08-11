"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  MetricHighlight,
  PrintMockup,
  PrintPieceType,
  ProjectStatus,
  ProjectSubcategory,
  ProjectType,
} from "@/types/database";

export type ProjectFormPayload = {
  slug: string;
  title: string;
  type: ProjectType;
  description: string;
  cover_url: string | null;
  media_urls: string[];
  video_embed: string | null;
  metrics: string | null;
  metrics_highlights: MetricHighlight[];
  external_url: string | null;
  featured: boolean;
  status: ProjectStatus;
  sort_order: number;
  subcategory: ProjectSubcategory | null;
  print_piece_type: PrintPieceType | null;
  print_mockup: PrintMockup | null;
};

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado.");
  return supabase;
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createProject(payload: ProjectFormPayload) {
  const supabase = await requireUser();

  const { error } = await supabase.from("projects").insert(payload);
  if (error) throw new Error(error.message);
}

export async function updateProject(id: string, payload: ProjectFormPayload) {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProject(id: string) {
  const supabase = await requireUser();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
