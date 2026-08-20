"use client";

import { useMemo, useState } from "react";
import {
  BadgeIcon,
  Blocks,
  FileText,
  Palette,
  Shirt,
  Sparkles,
} from "lucide-react";
import type { Project, ProjectType } from "@/types/database";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from "@/lib/project-types";
import { ProjectCard } from "@/components/project-card";

type DesignGroup = "todos" | "folders" | "vestimentas" | "identidade" | "campanhas";

const DESIGN_GROUPS: Array<{
  id: DesignGroup;
  title: string;
  description: string;
  icon: typeof Blocks;
}> = [
  {
    id: "todos",
    title: "Tudo em design",
    description: "Todos os trabalhos gráficos publicados.",
    icon: Blocks,
  },
  {
    id: "folders",
    title: "Folders",
    description: "Peças impressas com mockup e visualização 3D.",
    icon: FileText,
  },
  {
    id: "vestimentas",
    title: "Vestimentas",
    description: "Camisetas, bonés, uniformes e outras aplicações.",
    icon: Shirt,
  },
  {
    id: "identidade",
    title: "Identidade visual",
    description: "Marcas, logos, guias visuais e sistemas gráficos.",
    icon: BadgeIcon,
  },
  {
    id: "campanhas",
    title: "Campanhas e peças",
    description: "Artes de divulgação, criativos e materiais comerciais.",
    icon: Palette,
  },
];

function getDesignGroup(project: Project): Exclude<DesignGroup, "todos"> {
  const searchable = `${project.title} ${project.description}`.toLowerCase();
  const subcategory = String(project.subcategory ?? "");

  if (project.print_piece_type === "folder") return "folders";
  if (
    subcategory === "vestimentas" ||
    /camiseta|camisa|bon[eé]|uniforme|vestimenta|moletom|jaqueta|avental/.test(
      searchable,
    )
  ) {
    return "vestimentas";
  }
  if (/identidade|logo|logotipo|marca|branding|visual/.test(searchable)) {
    return "identidade";
  }

  return "campanhas";
}

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
  const [activeDesignGroup, setActiveDesignGroup] =
    useState<DesignGroup>("todos");

  const designProjects = useMemo(
    () => projects.filter((p) => p.type === "design"),
    [projects],
  );

  const designCounts = useMemo(() => {
    const counts: Record<DesignGroup, number> = {
      todos: designProjects.length,
      folders: 0,
      vestimentas: 0,
      identidade: 0,
      campanhas: 0,
    };

    designProjects.forEach((project) => {
      counts[getDesignGroup(project)] += 1;
    });

    return counts;
  }, [designProjects]);

  const filtered = useMemo(() => {
    if (activeType === "todos") return projects;
    if (activeType !== "design") {
      return projects.filter((p) => p.type === activeType);
    }

    if (activeDesignGroup === "todos") return designProjects;
    return designProjects.filter(
      (project) => getDesignGroup(project) === activeDesignGroup,
    );
  }, [activeDesignGroup, activeType, designProjects, projects]);

  const showDesignGroups = activeType === "design";
  const activeDesignGroupLabel =
    DESIGN_GROUPS.find((group) => group.id === activeDesignGroup)?.title ??
    "Design Gráfico";

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
            onClick={() => {
              setActiveType(type);
              if (type !== "design") setActiveDesignGroup("todos");
            }}
          />
        ))}
      </div>

      {showDesignGroups && (
        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-none tracking-[-0.04em] text-foreground">
                Design Gráfico
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Escolha uma frente para ver os projetos por tipo de entrega.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-border px-3 py-2 text-xs font-semibold text-muted">
              <Sparkles className="h-4 w-4 text-accent" />
              {designCounts.todos} projetos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {DESIGN_GROUPS.map((group) => {
              const Icon = group.icon;
              const count = designCounts[group.id];
              const active = activeDesignGroup === group.id;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveDesignGroup(group.id)}
                  className={`min-h-40 rounded-[8px] border p-4 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/20 text-foreground hover:border-primary"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <Icon
                      className={`h-6 w-6 ${
                        active ? "text-primary-foreground" : "text-accent"
                      }`}
                    />
                    <span
                      className={`rounded-[4px] px-2 py-1 text-xs font-bold ${
                        active
                          ? "bg-background/18 text-primary-foreground"
                          : count > 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface text-muted"
                      }`}
                    >
                      {count > 0 ? count : "Em breve"}
                    </span>
                  </span>
                  <span className="mt-5 block text-lg font-black leading-tight tracking-[-0.03em]">
                    {group.title}
                  </span>
                  <span
                    className={`mt-2 block text-sm leading-relaxed ${
                      active ? "text-primary-foreground/82" : "text-muted"
                    }`}
                  >
                    {group.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-[8px] border border-border p-6">
          <p className="text-lg font-black tracking-[-0.03em] text-foreground">
            Ainda nao tem projetos em {activeDesignGroupLabel}.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Esse bloco ja esta preparado para receber os proximos trabalhos de
            Design Grafico quando forem cadastrados.
          </p>
          {isAdmin && (
            <a
              href="/admin/projetos/novo"
              className="mt-5 inline-flex rounded-[4px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-background"
            >
              Cadastrar projeto
            </a>
          )}
        </div>
      )}
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
