"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Project, TrackedLink } from "@/types/database";
import { slugify } from "@/lib/slug";
import { SITE_URL } from "@/lib/site-url";
import {
  createTrackedLink,
  deleteTrackedLink,
  updateTrackedLink,
} from "@/lib/actions/tracked-links";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "text-sm text-muted";

type ProjectOption = Pick<Project, "id" | "slug" | "title">;

export function TrackedLinksManager({
  links,
  projects,
}: {
  links: TrackedLink[];
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // formulário de criação
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [destinationMode, setDestinationMode] = useState<"custom" | "project">(
    "custom",
  );
  const [destinationUrl, setDestinationUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [creating, setCreating] = useState(false);

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  function handleLabelChange(value: string) {
    setLabel(value);
    if (!codeTouched) setCode(slugify(value));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const destination =
      destinationMode === "project"
        ? (() => {
            const project = projects.find((p) => p.id === projectId);
            return project ? `/projetos/${project.slug}` : "";
          })()
        : destinationUrl;

    if (!label.trim() || !code.trim() || !destination) {
      setError("Preencha label, código e destino.");
      return;
    }

    setCreating(true);
    try {
      await createTrackedLink({
        code: slugify(code),
        label,
        destination_url: destination,
        project_id: destinationMode === "project" ? projectId : null,
      });
      setLabel("");
      setCode("");
      setCodeTouched(false);
      setDestinationUrl("");
      setProjectId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar link.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(link: TrackedLink) {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditDestination(link.destination_url);
  }

  async function saveEdit(link: TrackedLink) {
    setSavingEdit(true);
    setError(null);
    try {
      await updateTrackedLink(link.id, {
        code: link.code,
        label: editLabel,
        destination_url: editDestination,
        project_id: link.project_id,
      });
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar link.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esse link?")) return;
    try {
      await deleteTrackedLink(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir link.");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-4 rounded-xl border border-border p-5"
      >
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Novo link
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="link-label" className={labelClass}>
            Label
          </label>
          <input
            id="link-label"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Bio Instagram"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="link-code" className={labelClass}>
            Código ({SITE_URL}/go/<strong>{code || "codigo"}</strong>)
          </label>
          <input
            id="link-code"
            value={code}
            onChange={(e) => {
              setCodeTouched(true);
              setCode(e.target.value);
            }}
            className={inputClass}
          />
        </div>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={destinationMode === "custom"}
              onChange={() => setDestinationMode("custom")}
            />
            URL própria
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={destinationMode === "project"}
              onChange={() => setDestinationMode("project")}
            />
            Um projeto
          </label>
        </div>

        {destinationMode === "custom" ? (
          <input
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        ) : (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione um projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={creating}
          className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Criando..." : "Criar link"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Links criados
        </h2>

        {links.length === 0 && (
          <p className="text-sm text-muted">Nenhum link criado ainda.</p>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-xl border border-border p-4 text-sm"
          >
            {editingId === link.id ? (
              <div className="flex flex-col gap-3">
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className={inputClass}
                />
                <input
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  className={inputClass}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => saveEdit(link)}
                    disabled={savingEdit}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{link.label}</p>
                  <p className="text-muted">
                    {SITE_URL}/go/{link.code} → {link.destination_url}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {link.click_count} clique
                    {link.click_count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(link)}
                    className="text-primary hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(link.id)}
                    className="text-danger hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
