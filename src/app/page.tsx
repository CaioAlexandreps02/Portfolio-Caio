import Link from "next/link";
import { getPublishedProjects } from "@/lib/data/projects";
import { getUser } from "@/lib/supabase/auth";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilterGrid } from "@/components/project-filter-grid";
import { ProjectVisual } from "@/components/project-visual";

export default async function Home() {
  const [projects, user] = await Promise.all([
    getPublishedProjects(),
    getUser(),
  ]);
  const isAdmin = Boolean(user);
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const showcaseProjects = projects.slice(0, 5);

  return (
    <div className="home-shell">
      <section className="mx-auto grid min-h-[calc(100svh-73px)] max-w-[92rem] grid-cols-1 items-center gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:pb-0 lg:pt-4">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(4.5rem,11vw,8.4rem)] font-black leading-[0.84] tracking-[-0.04em] text-white">
            Caio Porto
          </h1>
          <p className="mt-7 max-w-xl text-[clamp(2rem,3.2vw,3.45rem)] font-black leading-[1.02] tracking-[-0.035em] text-white/82">
            Marketing, design e tecnologia em um portfólio só
          </p>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-white/76">
            Projetos que viram campanha, conteúdo, sistema e site.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#projetos"
              className="inline-flex min-h-16 items-center justify-center rounded-[4px] bg-primary px-8 text-lg font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-background"
            >
              Ver projetos <span className="ml-5">-&gt;</span>
            </Link>
            <Link
              href="/sobre"
              className="inline-flex min-h-16 items-center justify-center rounded-[4px] border border-white/42 px-8 text-lg font-semibold text-white transition-colors hover:border-primary hover:text-primary"
            >
              Falar comigo <span className="ml-5">-&gt;</span>
            </Link>
          </div>
        </div>

        <HeroShowcase projects={showcaseProjects} />
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-[92rem] px-5 py-12 sm:px-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[clamp(2.4rem,5vw,4.2rem)] font-black leading-none tracking-[-0.04em] text-white">
                Destaques
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                Uma amostra rápida da variedade: campanha, vídeo, produto
                digital, site e conteúdo.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      <section id="projetos" className="mx-auto max-w-[92rem] px-5 py-16 sm:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[clamp(2.8rem,5vw,4.4rem)] font-black leading-none tracking-[-0.04em] text-foreground">
            Projetos
          </h2>
          {isAdmin && (
            <Link
              href="/admin/projetos/novo"
              className="inline-flex w-fit rounded-[4px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-background"
            >
              + Novo projeto
            </Link>
          )}
        </div>
        <ProjectFilterGrid projects={projects} isAdmin={isAdmin} />
      </section>
    </div>
  );
}

function HeroShowcase({ projects }: { projects: Awaited<ReturnType<typeof getPublishedProjects>> }) {
  const fallback = projects.length > 0 ? projects : [];
  const first = fallback[0];
  const second = fallback[1] ?? first;
  const third = fallback[2] ?? first;
  const fourth = fallback[3] ?? first;
  const fifth = fallback[4] ?? first;

  if (!first) {
    return null;
  }

  return (
    <div className="relative min-h-[33rem] lg:min-h-[43rem]">
      <div className="absolute left-[22%] top-0 hidden w-[13rem] -rotate-1 overflow-hidden rounded-[8px] border border-white/16 lg:block">
        <div className="aspect-[0.78]">
          <ProjectVisual type={first.type} title={first.title} />
        </div>
      </div>
      <div className="absolute left-[46%] top-3 hidden w-[12rem] rotate-1 overflow-hidden rounded-[8px] border border-white/16 lg:block">
        <div className="aspect-[0.82]">
          <ProjectVisual type={second.type} title={second.title} />
        </div>
      </div>
      <div className="absolute left-[25%] top-[14rem] hidden w-[13rem] rotate-1 overflow-hidden rounded-[8px] border border-white/16 lg:block">
        <div className="aspect-[0.82]">
          <ProjectVisual type={third.type} title={third.title} />
        </div>
      </div>
      <div className="absolute left-[47%] top-[15rem] hidden w-[12rem] -rotate-1 overflow-hidden rounded-[8px] border border-white/16 lg:block">
        <div className="aspect-[0.82]">
          <ProjectVisual type={fourth.type} title={fourth.title} />
        </div>
      </div>

      <div className="absolute right-0 top-8 w-[min(18rem,42vw)] overflow-hidden rounded-[8px] border border-white/18 bg-black/20">
        <div className="aspect-[0.72]">
          <ProjectVisual type={fifth.type} title={fifth.title} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 border-t border-white/12 bg-black/35 px-4 py-3 text-xs text-white">
          <span className="h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-white" />
          <span>0:00 / 0:15</span>
          <span className="ml-auto">HD</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-[min(33rem,72vw)] overflow-hidden rounded-[8px] border border-white/16 bg-surface">
        <div className="aspect-[1.65] project-visual-site p-7 text-white">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>CP / Sites</span>
            <span className="rounded-[4px] bg-primary px-3 py-2">
              Ver estudo
            </span>
          </div>
          <div className="mt-14 max-w-xs text-[2rem] font-black uppercase leading-[0.92] tracking-[-0.035em]">
            Presença digital
            <span className="block text-accent">para vender melhor</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 hidden w-[24rem] overflow-hidden rounded-[8px] border border-white/16 bg-[#071a39] text-white xl:block">
        <div className="flex h-8 items-center justify-between border-b border-white/10 px-4 text-[11px]">
          <span>Dashboard</span>
          <span>Caio Porto</span>
        </div>
        <div className="grid grid-cols-[5rem_1fr]">
          <div className="space-y-3 border-r border-white/10 p-3 text-[10px] text-white/58">
            <div className="rounded-[4px] bg-primary px-2 py-1 text-white">
              Visão geral
            </div>
            <div>Projetos</div>
            <div>Clientes</div>
            <div>Conteúdo</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {["1.256", "R$ 98.765", "1.112"].map((value) => (
                <div key={value} className="rounded-[6px] bg-white/7 p-3">
                  <div className="text-[10px] text-white/55">Resultado</div>
                  <div className="mt-1 text-sm font-black">{value}</div>
                  <div className="mt-1 text-[10px] text-accent">+12.1%</div>
                </div>
              ))}
            </div>
            <div className="mt-5 h-20 rounded-[6px] bg-white/7 p-3">
              <div className="flex h-full items-end gap-2">
                {[30, 52, 44, 68, 58, 76, 71].map((height) => (
                  <span
                    key={height}
                    className="flex-1 rounded-t bg-primary"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
