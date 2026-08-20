import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { getPublishedProjects, getProjectBySlug } from "@/lib/data/projects";
import { getUser } from "@/lib/supabase/auth";
import { PROJECT_TYPE_LABELS } from "@/lib/project-types";
import { Gallery } from "@/components/gallery";
import { StatusToggle } from "@/components/status-toggle";
import { FolderMockup3D } from "@/components/folder-mockup-3d";
import { FolderProjectShowcase } from "@/components/folder-project-showcase";
import type { Project } from "@/types/database";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.cover_url ? [project.cover_url] : undefined,
    },
  };
}

export default async function ProjetoPage({ params }: Props) {
  const { slug } = await params;

  const [project, publishedProjects, user] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
    getUser(),
  ]);

  if (!project) notFound();

  const isAdmin = Boolean(user);
  const index = publishedProjects.findIndex((p) => p.slug === slug);
  const previous = index > 0 ? publishedProjects[index - 1] : null;
  const next =
    index !== -1 && index < publishedProjects.length - 1
      ? publishedProjects[index + 1]
      : null;

  if (project.print_mockup) {
    return (
      <FolderProjectPage
        project={project}
        isAdmin={isAdmin}
        previous={previous}
        next={next}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Voltar
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <StatusToggle projectId={project.id} status={project.status} />
            <Link
              href={`/admin/projetos/${project.slug}/editar`}
              className="text-sm text-primary hover:underline"
            >
              Editar
            </Link>
          </div>
        )}
      </div>

      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-surface">
        {project.cover_url && (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      <span className="mt-6 inline-block text-xs font-medium text-primary">
        {PROJECT_TYPE_LABELS[project.type]}
      </span>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-4 text-muted">{project.description}</p>

      {project.video_embed && (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={project.video_embed}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}

      {project.print_mockup && (
        <div className="mt-8">
          <FolderMockup3D mockup={project.print_mockup} />
        </div>
      )}

      <Gallery images={project.media_urls} />

      {(project.metrics || project.metrics_highlights.length > 0) && (
        <div className="mt-8 rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Métricas e resultados
          </h2>
          {project.metrics_highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-6">
              {project.metrics_highlights.map((h) => (
                <div key={h.label}>
                  <div className="text-2xl font-semibold text-primary">
                    {h.value}
                  </div>
                  <div className="text-xs text-muted">{h.label}</div>
                </div>
              ))}
            </div>
          )}
          {project.metrics && (
            <p className="mt-4 whitespace-pre-line text-sm text-muted">
              {project.metrics}
            </p>
          )}
        </div>
      )}

      {project.external_url && (
        <a
          href={project.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Acessar
        </a>
      )}

      <div className="mt-16 flex items-center justify-between border-t border-border pt-6 text-sm">
        {previous ? (
          <Link
            href={`/projetos/${previous.slug}`}
            className="text-muted hover:text-foreground"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/projetos/${next.slug}`}
            className="text-muted hover:text-foreground"
          >
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}

function FolderProjectPage({
  project,
  isAdmin,
  previous,
  next,
}: {
  project: Project;
  isAdmin: boolean;
  previous: Project | null;
  next: Project | null;
}) {
  const mockup = project.print_mockup;
  if (!mockup) return null;

  return (
    <div className="min-h-screen overflow-hidden bg-[oklch(0.09_0.04_258)] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_68%_10%,oklch(0.35_0.2_260/0.48),transparent_32rem)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[32rem] h-[24rem] bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.25_260/0.18),transparent_38rem)]" />

      <main className="relative mx-auto max-w-[92rem] px-5 py-10 sm:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/#projetos"
            className="inline-flex min-h-11 items-center rounded-[6px] border border-white/14 px-4 text-sm font-semibold text-white/78 transition-colors hover:border-primary hover:text-white"
          >
            &lt;- Voltar aos projetos
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <StatusToggle projectId={project.id} status={project.status} />
              <Link
                href={`/admin/projetos/${project.slug}/editar`}
                className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-white px-4 text-sm font-semibold text-background transition-colors hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </div>
          )}
        </div>

        <FolderProjectShowcase project={project} mockup={mockup} />

        <section
          id="detalhes"
          className="grid scroll-mt-28 gap-5 border-t border-white/12 py-12 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] font-black leading-none tracking-[-0.04em]">
              Uma peca feita para ser explorada
            </h2>
          </div>
          <div className="space-y-6 text-base leading-relaxed text-white/70">
            <p>
              A visualizacao 3D preserva a experiencia de abrir, fechar e
              orbitar o folder, mas agora fica dentro de uma pagina com mais
              contexto visual e ritmo de portfolio.
            </p>
            {(project.metrics || project.metrics_highlights.length > 0) && (
              <div className="grid gap-3 sm:grid-cols-3">
                {project.metrics_highlights.map((h) => (
                  <div
                    key={h.label}
                    className="rounded-[8px] border border-white/12 p-4"
                  >
                    <div className="text-2xl font-black text-accent">
                      {h.value}
                    </div>
                    <div className="mt-1 text-xs text-white/55">{h.label}</div>
                  </div>
                ))}
              </div>
            )}
            {project.metrics && (
              <p className="whitespace-pre-line">{project.metrics}</p>
            )}
          </div>
        </section>

        <Gallery images={project.media_urls} />

        <div className="flex items-center justify-between border-t border-white/12 py-8 text-sm">
          {previous ? (
            <Link
              href={`/projetos/${previous.slug}`}
              className="max-w-[45%] text-white/58 transition-colors hover:text-white"
            >
              &lt;- {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/projetos/${next.slug}`}
              className="max-w-[45%] text-right text-white/58 transition-colors hover:text-white"
            >
              {next.title} -&gt;
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
