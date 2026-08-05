import type { ProjectType } from "@/types/database";

const typeVisualClass: Record<ProjectType, string> = {
  design: "project-visual",
  video: "project-visual-coral",
  sistemas: "project-visual-light",
  sites: "project-visual-site",
  social_media: "project-visual-coral",
};

const typeHeadlines: Record<ProjectType, string[]> = {
  design: ["Gestão", "que move."],
  video: ["Resultados", "que viajam"],
  sistemas: ["Dados e foco", "em entregas."],
  sites: ["Presença", "que converte."],
  social_media: ["Conteúdo", "em movimento."],
};

export function ProjectVisual({
  type,
  title,
  compact = false,
}: {
  type: ProjectType;
  title: string;
  compact?: boolean;
}) {
  const lines = typeHeadlines[type];

  return (
    <div
      className={`relative h-full min-h-0 overflow-hidden ${typeVisualClass[type]}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_48%,oklch(1_0_0/0.08)_48.5%,transparent_49%)]" />
      <div className="absolute right-4 bottom-4 h-16 w-28 rounded-[10px] border border-white/18 bg-black/25 p-2">
        <div className="mb-2 h-1.5 w-12 rounded-full bg-white/50" />
        <div className="space-y-1">
          <div className="h-1 rounded-full bg-primary" />
          <div className="h-1 rounded-full bg-accent" />
          <div className="h-1 w-2/3 rounded-full bg-white/30" />
        </div>
      </div>
      <div className="absolute right-7 top-7 h-16 w-16 rounded-full border border-white/10 bg-white/10" />
      <div className="absolute -bottom-8 left-1/2 h-28 w-36 -translate-x-1/2 rounded-t-full bg-black/20" />

      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            CP
          </span>
          {type === "video" && <span>00:15</span>}
        </div>

        <div>
          <p
            className={`max-w-[12rem] font-black uppercase leading-[0.92] tracking-[-0.03em] ${
              compact ? "text-[1.75rem]" : "text-[2.15rem]"
            }`}
          >
            {lines[0]}
            <span className="block text-accent">{lines[1]}</span>
          </p>
          {!compact && (
            <p className="mt-3 max-w-[15rem] text-xs font-medium leading-relaxed text-white/74">
              {title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
