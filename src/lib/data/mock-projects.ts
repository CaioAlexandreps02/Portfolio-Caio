import type { Project } from "@/types/database";

function placeholderPanel(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" font-size="42" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    slug: "identidade-visual-turbo-diesel",
    title: "Identidade Visual - Kit Turbo Diesel",
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
    print_mockup: null,
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
    print_mockup: null,
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
    print_mockup: null,
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "4",
    slug: "site-institucional-loja",
    title: "Site Institucional - Loja",
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
    print_mockup: null,
    created_at: "2026-01-04T00:00:00Z",
    updated_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "5",
    slug: "estrategia-instagram-q1",
    title: "Estratégia de Conteúdo - Instagram Q1",
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
    print_mockup: null,
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "6",
    slug: "folder-institucional-embrepoli",
    title: "Folder Institucional",
    type: "design",
    description:
      "Folder impresso bifold (formato A4) de apresentação institucional, com mockup 3D interativo — clique pra abrir.",
    cover_url: null,
    media_urls: [],
    video_embed: null,
    metrics: null,
    metrics_highlights: [],
    external_url: null,
    featured: false,
    status: "published",
    sort_order: 6,
    print_mockup: {
      front_cover: placeholderPanel("Capa", "#2563eb"),
      back_cover: placeholderPanel("Contra-capa", "#1d4ed8"),
      inner_left: placeholderPanel("Interna Esquerda", "#1e40af"),
      inner_right: placeholderPanel("Interna Direita", "#1e3a8a"),
    },
    created_at: "2026-01-06T00:00:00Z",
    updated_at: "2026-01-06T00:00:00Z",
  },
];

export function getPublishedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.status === "published").sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}
