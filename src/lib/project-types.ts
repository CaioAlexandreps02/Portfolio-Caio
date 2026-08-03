import type { ProjectType } from "@/types/database";

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
