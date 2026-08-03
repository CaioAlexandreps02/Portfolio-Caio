import type { Project } from "@/types/database";

/**
 * Dados de exemplo — substituir por consulta ao Supabase quando o projeto existir.
 * Ver getSiteSettings() em src/lib/data/site-settings.ts para o padrão a seguir.
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    slug: "identidade-visual-turbo-diesel",
    title: "Identidade Visual — Kit Turbo Diesel",
    type: "design",
    description:
      "Criação de peças de campanha para lançamento de linha de kits turbo, com foco em performance e confiança técnica.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [{ label: "Alcance", value: "85k" }],
    external_url: null,
    featured: true,
    status: "published",
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    slug: "reel-institucional-embrepoli",
    title: "Reel Institucional",
    type: "video",
    description:
      "Edição de vídeo institucional mostrando o processo produtivo e os bastidores da fábrica.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [{ label: "Visualizações", value: "120k" }],
    external_url: null,
    featured: true,
    status: "published",
    sort_order: 2,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "3",
    slug: "sistema-gestao-marketing",
    title: "Sistema de Gestão de Marketing",
    type: "sistemas",
    description:
      "Plataforma interna para gestão de calendário de conteúdo, produtos e aprovações, construída com Next.js e Supabase.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [],
    external_url: null,
    featured: true,
    status: "published",
    sort_order: 3,
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "4",
    slug: "site-institucional-loja",
    title: "Site Institucional — Loja",
    type: "sites",
    description:
      "Site institucional responsivo com catálogo de produtos e formulário de contato.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [],
    external_url: null,
    featured: false,
    status: "published",
    sort_order: 4,
    created_at: "2026-01-04T00:00:00Z",
    updated_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "5",
    slug: "estrategia-instagram-q1",
    title: "Estratégia de Conteúdo — Instagram Q1",
    type: "social_media",
    description:
      "Planejamento e execução de calendário de conteúdo trimestral, com crescimento consistente de engajamento.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [{ label: "Crescimento", value: "+18%" }],
    external_url: null,
    featured: false,
    status: "published",
    sort_order: 5,
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-01-05T00:00:00Z",
  },
];

export function getPublishedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.status === "published").sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}
