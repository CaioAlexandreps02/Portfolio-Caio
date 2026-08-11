"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  MetricHighlight,
  PrintMockup,
  Project,
  ProjectStatus,
  ProjectType,
} from "@/types/database";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from "@/lib/project-types";
import { slugify } from "@/lib/slug";
import { driveShareLinkToDirectUrl } from "@/lib/drive";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import {
  createProject,
  deleteProject,
  updateProject,
  type ProjectFormPayload,
} from "@/lib/actions/projects";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "text-sm text-muted";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEditing = Boolean(project);

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [type, setType] = useState<ProjectType>(project?.type ?? "design");
  const [description, setDescription] = useState(project?.description ?? "");
  const [coverInput, setCoverInput] = useState(project?.cover_url ?? "");
  const [galleryLinks, setGalleryLinks] = useState<string[]>(
    project?.media_urls ?? [],
  );
  const [newGalleryLink, setNewGalleryLink] = useState("");
  const [videoInput, setVideoInput] = useState(project?.video_embed ?? "");
  const [metrics, setMetrics] = useState(project?.metrics ?? "");
  const [highlights, setHighlights] = useState<MetricHighlight[]>(
    project?.metrics_highlights ?? [],
  );
  const [externalUrl, setExternalUrl] = useState(project?.external_url ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(project?.sort_order ?? 0);
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "draft",
  );

  const [hasMockup, setHasMockup] = useState(Boolean(project?.print_mockup));
  const [mockupFrontCover, setMockupFrontCover] = useState(
    project?.print_mockup?.front_cover ?? "",
  );
  const [mockupBackCover, setMockupBackCover] = useState(
    project?.print_mockup?.back_cover ?? "",
  );
  const [mockupInnerLeft, setMockupInnerLeft] = useState(
    project?.print_mockup?.inner_left ?? "",
  );
  const [mockupInnerRight, setMockupInnerRight] = useState(
    project?.print_mockup?.inner_right ?? "",
  );

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addGalleryLink() {
    if (!newGalleryLink.trim()) return;
    setGalleryLinks((prev) => [
      ...prev,
      driveShareLinkToDirectUrl(newGalleryLink),
    ]);
    setNewGalleryLink("");
  }

  function removeGalleryLink(index: number) {
    setGalleryLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveGalleryLink(from: number, to: number) {
    if (to < 0 || to >= galleryLinks.length) return;
    setGalleryLinks((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, { label: "", value: "" }]);
  }

  function updateHighlight(
    index: number,
    field: keyof MetricHighlight,
    value: string,
  ) {
    setHighlights((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  }

  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim()) {
      setError("Título e slug são obrigatórios.");
      return;
    }

    setSaving(true);

    let print_mockup: PrintMockup | null = null;
    if (hasMockup) {
      if (
        !mockupFrontCover ||
        !mockupBackCover ||
        !mockupInnerLeft ||
        !mockupInnerRight
      ) {
        setError(
          "Preencha as 4 imagens do mockup (capa, contra-capa e as 2 partes internas), ou desative o mockup.",
        );
        setSaving(false);
        return;
      }
      print_mockup = {
        front_cover: driveShareLinkToDirectUrl(mockupFrontCover),
        back_cover: driveShareLinkToDirectUrl(mockupBackCover),
        inner_left: driveShareLinkToDirectUrl(mockupInnerLeft),
        inner_right: driveShareLinkToDirectUrl(mockupInnerRight),
      };
    }

    const payload: ProjectFormPayload = {
      slug: slugify(slug),
      title,
      type,
      description,
      cover_url: coverInput ? driveShareLinkToDirectUrl(coverInput) : null,
      media_urls: galleryLinks,
      video_embed: videoInput ? toYoutubeEmbedUrl(videoInput) : null,
      metrics: metrics || null,
      metrics_highlights: highlights.filter((h) => h.label && h.value),
      external_url: externalUrl || null,
      featured,
      status,
      sort_order: sortOrder,
      print_mockup,
    };

    try {
      if (isEditing && project) {
        await updateProject(project.id, payload);
      } else {
        await createProject(payload);
      }
      router.push(`/projetos/${payload.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm("Excluir esse projeto permanentemente?")) return;

    setSaving(true);
    try {
      await deleteProject(project.id);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          Título
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className={labelClass}>
          Tipo
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as ProjectType)}
          className={inputClass}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Descrição
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover" className={labelClass}>
          Imagem de capa (link de compartilhamento do Google Drive)
        </label>
        <input
          id="cover"
          value={coverInput}
          onChange={(e) => setCoverInput(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Galeria de imagens</span>
        <div className="flex gap-2">
          <input
            value={newGalleryLink}
            onChange={(e) => setNewGalleryLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={addGalleryLink}
            className="rounded-lg border border-border px-4 text-sm hover:border-primary"
          >
            Adicionar
          </button>
        </div>

        {galleryLinks.length > 0 && (
          <ul className="mt-2 flex flex-col gap-2">
            {galleryLinks.map((link, index) => (
              <li
                key={link + index}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) moveGalleryLink(dragIndex, index);
                  setDragIndex(null);
                }}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="cursor-grab text-muted" aria-hidden="true">
                  ⠿
                </span>
                <span className="flex-1 truncate">{link}</span>
                <button
                  type="button"
                  onClick={() => moveGalleryLink(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  className="text-muted hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveGalleryLink(index, index + 1)}
                  disabled={index === galleryLinks.length - 1}
                  aria-label="Mover para baixo"
                  className="text-muted hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeGalleryLink(index)}
                  aria-label="Remover"
                  className="text-muted hover:text-foreground"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="video" className={labelClass}>
          Link de vídeo (YouTube)
        </label>
        <input
          id="video"
          value={videoInput}
          onChange={(e) => setVideoInput(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hasMockup}
            onChange={(e) => setHasMockup(e.target.checked)}
          />
          Este projeto é uma peça impressa com mockup 3D
        </label>

        {hasMockup && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted">
              Folder bifold (uma dobra, formato A4) — cole o link de
              compartilhamento do Google Drive de cada uma das 4 artes.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mockup_front" className={labelClass}>
                Capa — link do Google Drive
              </label>
              <input
                id="mockup_front"
                value={mockupFrontCover}
                onChange={(e) => setMockupFrontCover(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mockup_back" className={labelClass}>
                Contra-capa — link do Google Drive
              </label>
              <input
                id="mockup_back"
                value={mockupBackCover}
                onChange={(e) => setMockupBackCover(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mockup_inner_left" className={labelClass}>
                Parte interna esquerda — link do Google Drive
              </label>
              <input
                id="mockup_inner_left"
                value={mockupInnerLeft}
                onChange={(e) => setMockupInnerLeft(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mockup_inner_right" className={labelClass}>
                Parte interna direita — link do Google Drive
              </label>
              <input
                id="mockup_inner_right"
                value={mockupInnerRight}
                onChange={(e) => setMockupInnerRight(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="metrics" className={labelClass}>
          Métricas e resultados (texto livre)
        </label>
        <textarea
          id="metrics"
          rows={3}
          value={metrics}
          onChange={(e) => setMetrics(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Destaques estruturados</span>
        {highlights.map((h, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={h.label}
              onChange={(e) =>
                updateHighlight(index, "label", e.target.value)
              }
              placeholder="Alcance"
              className={`${inputClass} flex-1`}
            />
            <input
              value={h.value}
              onChange={(e) =>
                updateHighlight(index, "value", e.target.value)
              }
              placeholder="120k"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeHighlight(index)}
              aria-label="Remover destaque"
              className="text-muted hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHighlight}
          className="self-start rounded-lg border border-border px-4 py-1.5 text-sm hover:border-primary"
        >
          + Adicionar destaque
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="external_url" className={labelClass}>
          Link externo
        </label>
        <input
          id="external_url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Destaque na home
        </label>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sort_order" className={labelClass}>
            Ordem de exibição
          </label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className={inputClass}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar projeto"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-sm text-danger hover:underline disabled:opacity-50"
          >
            Excluir projeto
          </button>
        )}
      </div>
    </form>
  );
}
