import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getPublishedProjects } from "@/lib/data/projects";
import { SiteSettingsForm } from "@/components/site-settings-form";
import { FeaturedOrderList } from "@/components/featured-order-list";

export default async function ConfiguracoesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
  ]);
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Sobre e contato
        </h2>
        <div className="mt-4">
          <SiteSettingsForm settings={settings} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Ordem dos destaques
        </h2>
        <div className="mt-4">
          <FeaturedOrderList projects={featured} />
        </div>
      </section>
    </div>
  );
}
