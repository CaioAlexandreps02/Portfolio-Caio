import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/database";
import { PROJECT_TYPE_LABELS } from "@/lib/project-types";

export function ProjectCard({
  project,
  isAdmin = false,
}: {
  project: Project;
  isAdmin?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary">
      {isAdmin && (
        <Link
          href={`/admin/projetos/${project.slug}/editar`}
          aria-label={`Editar ${project.title}`}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-primary hover:text-primary-foreground"
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
        <div className="relative aspect-video w-full overflow-hidden bg-border">
          {project.cover_url && (
            <Image
              src={project.cover_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-4">
          <span className="text-xs font-medium text-primary">
            {PROJECT_TYPE_LABELS[project.type]}
          </span>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            {project.title}
          </h3>
        </div>
      </Link>
    </div>
  );
}
