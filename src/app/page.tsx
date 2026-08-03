import Link from "next/link";
import { getPublishedProjects } from "@/lib/data/projects";
import { getUser } from "@/lib/supabase/auth";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilterGrid } from "@/components/project-filter-grid";

export default async function Home() {
  const [projects, user] = await Promise.all([
    getPublishedProjects(),
    getUser(),
  ]);
  const isAdmin = Boolean(user);
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="flex flex-col items-start gap-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Caio Porto
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Profissional de Marketing atuando em design gráfico, vídeo, social
          media, sistemas e desenvolvimento de sites.
        </p>
        <div className="flex gap-4">
          <Link
            href="#projetos"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver projetos
          </Link>
          <Link
            href="/sobre"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary"
          >
            Falar comigo
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-12">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Projetos em destaque
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      <section id="projetos" className="py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Todos os projetos
          </h2>
          {isAdmin && (
            <Link
              href="/admin/projetos/novo"
              className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              + Novo projeto
            </Link>
          )}
        </div>
        <div className="mt-6">
          <ProjectFilterGrid projects={projects} isAdmin={isAdmin} />
        </div>
      </section>
    </div>
  );
}
