import { createClient } from "@/lib/supabase/server";
import {
  MOCK_PROJECTS,
  getPublishedProjects as getMockPublishedProjects,
} from "@/lib/data/mock-projects";
import type { Project } from "@/types/database";

/**
 * Tenta o Supabase real primeiro; cai pros dados mock enquanto o projeto
 * Supabase não existir (ver .env.local). RLS já filtra o que cada sessão pode ver.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return getMockPublishedProjects();
    return data;
  } catch {
    return getMockPublishedProjects();
  }
}

/** Lista simplificada pra uso em admin (seletor de projeto associado a um link, etc). */
export async function getAllProjectsForAdmin(): Promise<
  Pick<Project, "id" | "slug" | "title">[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, slug, title")
      .order("title", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return MOCK_PROJECTS.find((p) => p.slug === slug) ?? null;
    }
    return data;
  } catch {
    return MOCK_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
}
