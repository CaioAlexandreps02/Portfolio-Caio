"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/database";
import { updateFeaturedOrder } from "@/lib/actions/site-settings";

export function FeaturedOrderList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moveAndPersist(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;

    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);

    setSaving(true);
    setError(null);
    try {
      await updateFeaturedOrder(next.map((p) => p.id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar ordem.");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nenhum projeto marcado como destaque.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {items.map((project, index) => (
          <li
            key={project.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) void moveAndPersist(dragIndex, index);
              setDragIndex(null);
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="cursor-grab text-muted" aria-hidden="true">
              ⠿
            </span>
            <span className="flex-1">{project.title}</span>
            <button
              type="button"
              onClick={() => moveAndPersist(index, index - 1)}
              disabled={index === 0}
              aria-label="Mover para cima"
              className="text-muted hover:text-foreground disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveAndPersist(index, index + 1)}
              disabled={index === items.length - 1}
              aria-label="Mover para baixo"
              className="text-muted hover:text-foreground disabled:opacity-30"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      {saving && <p className="text-xs text-muted">Salvando ordem...</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
