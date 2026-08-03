"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/types/database";

const LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function StatusToggle({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ProjectStatus;
    setSaving(true);
    setError(null);
    try {
      await updateProjectStatus(projectId, next);
      setCurrent(next);
      router.refresh();
    } catch {
      setError("Não deu pra salvar (Supabase ainda não configurado?).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <select
        value={current}
        onChange={handleChange}
        disabled={saving}
        className="rounded-full border border-border bg-background px-3 py-1 text-xs disabled:opacity-50"
      >
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
