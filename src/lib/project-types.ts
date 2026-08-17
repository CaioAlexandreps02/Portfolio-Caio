import type { ProjectStatus, ProjectType } from "@/types/database";

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  design: "Design Gráfico",
  video: "Vídeo",
  sistemas: "Sistemas",
  sites: "Sites",
  social_media: "Social Media",
};

export const PROJECT_TYPES: ProjectType[] = [
  "design",
  "video",
  "sistemas",
  "sites",
  "social_media",
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};
