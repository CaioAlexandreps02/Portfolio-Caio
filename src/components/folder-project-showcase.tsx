"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  Expand,
  Hand,
  Layers3,
  Maximize2,
  MousePointer2,
  X,
  ZoomIn,
} from "lucide-react";
import { PROJECT_TYPE_LABELS } from "@/lib/project-types";
import { FolderMockup3D } from "@/components/folder-mockup-3d";
import type { PrintMockup, Project } from "@/types/database";

type FolderFace = {
  label: string;
  image: string;
};

function imageSrc(url: string): string {
  if (url.startsWith("data:")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=1200&q=82`;
}

export function FolderProjectShowcase({
  project,
  mockup,
}: {
  project: Project;
  mockup: PrintMockup;
}) {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const year = new Date(project.created_at).getFullYear();
  const details = [
    {
      icon: BriefcaseBusiness,
      label: "Servico",
      value: PROJECT_TYPE_LABELS[project.type],
    },
    {
      icon: CalendarDays,
      label: "Ano",
      value: Number.isNaN(year) ? "Projeto publicado" : String(year),
    },
    {
      icon: Layers3,
      label: "Peca",
      value: "Folder bifold A4",
    },
  ];

  useEffect(() => {
    function syncFullscreen() {
      setFullscreen(document.fullscreenElement === viewerRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  function toggleFolder() {
    setOpen((current) => !current);
    viewerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function toggleFullscreen() {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (document.fullscreenElement === viewer) {
      await document.exitFullscreen();
      return;
    }

    await viewer.requestFullscreen();
  }

  return (
    <section className="grid min-h-[calc(100svh-9rem)] items-center gap-8 py-10 lg:grid-cols-[0.52fr_1.48fr] lg:py-6">
      <aside className="max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-[6px] border border-white/14 px-4 py-2 text-sm font-semibold text-accent">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Design grafico
        </span>

        <div className="mt-8 h-1 w-14 rounded-full bg-coral" />

        <h1 className="mt-7 text-[clamp(3.4rem,7vw,6.4rem)] font-black leading-[0.94] tracking-[-0.04em] sm:leading-[0.88]">
          {project.title}
        </h1>
        <p className="mt-7 max-w-md text-lg leading-relaxed text-white/72">
          {project.description}
        </p>

        <div className="mt-9 grid max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={toggleFolder}
            aria-pressed={open}
            className="group inline-flex min-h-28 flex-col justify-between rounded-[8px] bg-primary p-5 text-left text-primary-foreground transition-colors hover:bg-accent hover:text-background"
          >
            <Maximize2 className="h-6 w-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="text-base font-semibold">
              {open ? "Fechar folder" : "Abrir folder"}
            </span>
          </button>
          <a
            href="#detalhes"
            className="inline-flex min-h-28 flex-col justify-between rounded-[8px] border border-primary/70 p-5 text-white transition-colors hover:border-accent hover:text-accent"
          >
            <Eye className="h-6 w-6" />
            <span className="text-base font-semibold">Ver detalhes</span>
          </a>
        </div>

        <dl className="mt-8 divide-y divide-white/12 border-y border-white/12">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-4">
              <Icon className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <dt className="text-xs text-white/45">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-white/88">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </aside>

      <div id="folder-viewer" className="relative scroll-mt-28">
        <div className="pointer-events-none absolute inset-x-8 bottom-8 h-24 rounded-full bg-primary/20 blur-3xl" />
        <div
          ref={viewerRef}
          className="relative overflow-hidden rounded-[10px] border border-white/10 bg-[linear-gradient(145deg,oklch(0.13_0.055_258),oklch(0.075_0.035_258))] fullscreen:rounded-none fullscreen:border-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,oklch(0.86_0.24_126/0.14),transparent_18rem),radial-gradient(circle_at_36%_76%,oklch(0.62_0.25_260/0.18),transparent_24rem)]" />
          <div className="relative grid gap-5 p-4 lg:grid-cols-[1fr_5.75rem] lg:p-6">
            <FolderMockup3D
              mockup={mockup}
              variant="showcase"
              open={open}
              onOpenChange={setOpen}
              showToggleButton={false}
            />
            <ViewerDock
              fullscreen={fullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </div>
        </div>
        <FolderFaceStrip mockup={mockup} />
      </div>
    </section>
  );
}

function ViewerDock({
  fullscreen,
  onToggleFullscreen,
}: {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
      <div className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-black/16 px-2 text-center text-[11px] font-medium text-white/74">
        <Hand className="h-5 w-5 text-white" />
        <span>Arraste</span>
      </div>
      <div className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-black/16 px-2 text-center text-[11px] font-medium text-white/74">
        <ZoomIn className="h-5 w-5 text-white" />
        <span>Zoom</span>
      </div>
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-black/16 px-2 text-center text-[11px] font-medium text-white/80 transition-colors hover:border-accent hover:text-accent"
      >
        <Expand className="h-5 w-5" />
        <span>{fullscreen ? "Sair" : "Tela cheia"}</span>
      </button>
    </div>
  );
}

function FolderFaceStrip({ mockup }: { mockup: PrintMockup }) {
  const faces = [
    { label: "Capa", image: mockup.front_cover },
    { label: "Interna esquerda", image: mockup.inner_left },
    { label: "Verso", image: mockup.back_cover },
    { label: "Interna direita", image: mockup.inner_right },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {faces.map((face, index) => (
          <figure key={face.label} className="group">
            <figcaption className="mb-2 text-center text-sm font-semibold text-white/86">
              {face.label}
            </figcaption>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className={`block w-full overflow-hidden rounded-[8px] border bg-black/18 p-3 text-left transition-colors ${
                index === 0
                  ? "border-primary"
                  : "border-white/12 group-hover:border-accent/70"
              }`}
            >
              <span className="sr-only">Ver {face.label} ampliada</span>
              <span className="relative block aspect-[16/9] overflow-hidden rounded-[4px] bg-white/8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc(face.image)}
                  alt={`${face.label} do folder`}
                  className="h-full w-full object-cover"
                />
              </span>
            </button>
          </figure>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-white/66">
        <MousePointer2 className="h-5 w-5 text-accent" />
        <span>Arraste para girar, use scroll para zoom ou clique nas faces.</span>
        <div className="hidden h-px flex-1 bg-white/12 sm:block" />
      </div>

      {openIndex !== null && (
        <FolderFaceModal
          faces={faces}
          openIndex={openIndex}
          onOpenIndexChange={setOpenIndex}
        />
      )}
    </div>
  );
}

function FolderFaceModal({
  faces,
  openIndex,
  onOpenIndexChange,
}: {
  faces: FolderFace[];
  openIndex: number;
  onOpenIndexChange: (index: number | null) => void;
}) {
  const close = useCallback(() => onOpenIndexChange(null), [onOpenIndexChange]);
  const showPrevious = useCallback(
    () => onOpenIndexChange((openIndex - 1 + faces.length) % faces.length),
    [faces.length, onOpenIndexChange, openIndex],
  );
  const showNext = useCallback(
    () => onOpenIndexChange((openIndex + 1) % faces.length),
    [faces.length, onOpenIndexChange, openIndex],
  );
  const face = faces[openIndex];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrevious();
      if (e.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, showNext, showPrevious]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={face.label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.055_0.028_258/0.94)] p-4 backdrop-blur-sm sm:p-8"
      onClick={close}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Fechar"
        className="absolute right-5 top-5 rounded-[8px] border border-white/14 bg-white/8 p-3 text-white transition-colors hover:border-accent hover:text-accent"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          showPrevious();
        }}
        aria-label="Face anterior"
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-[8px] border border-white/14 bg-white/8 px-4 py-3 text-2xl text-white transition-colors hover:border-accent hover:text-accent sm:block"
      >
        &lt;
      </button>

      <div
        className="w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-center text-sm font-semibold text-accent">
          {face.label}
        </p>
        <div className="relative mx-auto flex max-h-[78vh] items-center justify-center overflow-hidden rounded-[10px] border border-white/12 bg-black/22 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc(face.image)}
            alt={`${face.label} do folder ampliada`}
            className="max-h-[72vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          showNext();
        }}
        aria-label="Proxima face"
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-[8px] border border-white/14 bg-white/8 px-4 py-3 text-2xl text-white transition-colors hover:border-accent hover:text-accent sm:block"
      >
        &gt;
      </button>
    </div>
  );
}
