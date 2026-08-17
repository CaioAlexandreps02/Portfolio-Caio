"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project, ProjectStatus } from "@/types/database";
import { PROJECT_TYPE_LABELS, STATUS_LABELS } from "@/lib/project-types";
import { deleteProject, updateProjectStatus } from "@/lib/actions/projects";

export function AdminProjectsList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: ProjectStatus) {
    setBusyId(id);
    setError(null);
    try {
      await updateProjectStatus(id, status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao mudar status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}" permanentemente?`)) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteProject(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setBusyId(null);
    }
  }

  if (projects.length === 0) {
    return <p className="text-sm text-muted">Nenhum projeto ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      <ul className="flex flex-col gap-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/projetos/${project.slug}/editar`}
                className="truncate text-sm font-medium hover:text-primary"
              >
                {project.title}
              </Link>
              <p className="text-xs text-muted">
                {PROJECT_TYPE_LABELS[project.type]}
              </p>
            </div>

            <select
              value={project.status}
              disabled={busyId === project.id}
              onChange={(e) =>
                handleStatusChange(project.id, e.target.value as ProjectStatus)
              }
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary disabled:opacity-50"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <Link
              href={`/admin/projetos/${project.slug}/editar`}
              className="text-sm text-muted hover:text-foreground"
            >
              Editar
            </Link>

            <button
              type="button"
              onClick={() => handleDelete(project.id, project.title)}
              disabled={busyId === project.id}
              className="text-sm text-danger hover:underline disabled:opacity-50"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
