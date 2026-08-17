"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  MetricHighlight,
  PrintMockup,
  PrintPieceType,
  Project,
  ProjectStatus,
  ProjectSubcategory,
  ProjectType,
} from "@/types/database";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  STATUS_LABELS,
} from "@/lib/project-types";
import { slugify } from "@/lib/slug";
import { driveShareLinkToDirectUrl } from "@/lib/drive";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import {
  createProject,
  deleteProject,
  updateProject,
  type ProjectFormPayload,
} from "@/lib/actions/projects";
import { FolderMockupEditor } from "@/components/folder-mockup-editor";

const SUBCATEGORY_LABELS: Record<ProjectSubcategory, string> = {
  impressos: "Impressos",
};

const PRINT_PIECE_TYPE_LABELS: Record<PrintPieceType, string> = {
  folder: "Folder Impresso",
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

  const [subcategory, setSubcategory] = useState<ProjectSubcategory | "">(
    project?.subcategory ?? "",
  );
  const [printPieceType, setPrintPieceType] = useState<PrintPieceType | "">(
    project?.print_piece_type ?? "",
  );
  const [mockup, setMockup] = useState<Partial<PrintMockup>>(
    project?.print_mockup ?? {},
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

    const subcategoryValue = type === "design" && subcategory ? subcategory : null;
    const printPieceTypeValue =
      subcategoryValue === "impressos" && printPieceType ? printPieceType : null;

    let print_mockup: PrintMockup | null = null;
    if (printPieceTypeValue === "folder") {
      const { front_cover, back_cover, inner_left, inner_right } = mockup;
      if (!front_cover || !back_cover || !inner_left || !inner_right) {
        setError(
          "Selecione as 4 imagens do mockup (capa, contra-capa e as 2 partes internas).",
        );
        setSaving(false);
        return;
      }
      print_mockup = { front_cover, back_cover, inner_left, inner_right };
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
      subcategory: subcategoryValue,
      print_piece_type: printPieceTypeValue,
      print_mockup,
    };

    try {
      if (isEditing && project) {
        await updateProject(project.id, payload);
      } else {
        await createProject(payload);
      }
      router.push(`/projetos/${payload.slug}`);
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
          onChange={(e) => {
            const next = e.target.value as ProjectType;
            setType(next);
            if (next !== "design") {
              setSubcategory("");
              setPrintPieceType("");
            }
          }}
          className={inputClass}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {type === "design" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className={labelClass}>
            Subcategoria
          </label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => {
              const next = e.target.value as ProjectSubcategory | "";
              setSubcategory(next);
              if (next !== "impressos") setPrintPieceType("");
            }}
            className={inputClass}
          >
            <option value="">(nenhuma)</option>
            {Object.entries(SUBCATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {subcategory === "impressos" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="print_piece_type" className={labelClass}>
            Tipo de impresso
          </label>
          <select
            id="print_piece_type"
            value={printPieceType}
            onChange={(e) =>
              setPrintPieceType(e.target.value as PrintPieceType | "")
            }
            className={inputClass}
          >
            <option value="">(nenhum)</option>
            {Object.entries(PRINT_PIECE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

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

      {printPieceType === "folder" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <span className="text-sm font-medium">Mockup 3D do folder</span>
          <p className="text-xs text-muted">
            Clique em cada parte pra escolher a imagem direto do seu Google
            Drive.
          </p>
          <FolderMockupEditor value={mockup} onChange={setMockup} />
        </div>
      )}

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
