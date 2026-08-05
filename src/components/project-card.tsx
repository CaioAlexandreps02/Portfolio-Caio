import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/database";
import { PROJECT_TYPE_LABELS } from "@/lib/project-types";
import { ProjectVisual } from "@/components/project-visual";

export function ProjectCard({
  project,
  isAdmin = false,
}: {
  project: Project;
  isAdmin?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[12px] border border-border bg-surface transition-colors hover:border-primary">
      {isAdmin && (
        <Link
          href={`/admin/projetos/${project.slug}/editar`}
          aria-label={`Editar ${project.title}`}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </Link>
      )}

      <Link href={`/projetos/${project.slug}`}>
        <div className="relative aspect-[1.42] w-full overflow-hidden bg-border">
          {project.cover_url ? (
            <Image
              src={project.cover_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ProjectVisual type={project.type} title={project.title} compact />
          )}
        </div>
        <div className="p-5">
          <span className="text-xs font-bold text-primary">
            {PROJECT_TYPE_LABELS[project.type]}
          </span>
          <h3 className="mt-2 text-xl font-black leading-tight tracking-[-0.03em] text-foreground">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            {project.description}
          </p>
        </div>
      </Link>
    </div>
  );
}
