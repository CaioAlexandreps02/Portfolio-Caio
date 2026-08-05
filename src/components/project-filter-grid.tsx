"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectType } from "@/types/database";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from "@/lib/project-types";
import { ProjectCard } from "@/components/project-card";

export function ProjectFilterGrid({
  projects,
  isAdmin = false,
}: {
  projects: Project[];
  isAdmin?: boolean;
}) {
  const [activeType, setActiveType] = useState<ProjectType | "todos">(
    "todos",
  );

  const filtered = useMemo(
    () =>
      activeType === "todos"
        ? projects
        : projects.filter((p) => p.type === activeType),
    [projects, activeType],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <FilterButton
          label="Todos"
          active={activeType === "todos"}
          onClick={() => setActiveType("todos")}
        />
        {PROJECT_TYPES.map((type) => (
          <FilterButton
            key={type}
            label={PROJECT_TYPE_LABELS[type]}
            active={activeType === type}
            onClick={() => setActiveType(type)}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-28 rounded-[6px] border px-5 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/20 text-foreground hover:border-primary"
      }`}
    >
      {label}
    </button>
  );
}
