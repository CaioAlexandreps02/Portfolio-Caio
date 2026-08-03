import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { getTrackedLinks } from "@/lib/data/tracked-links";
import { getAllProjectsForAdmin } from "@/lib/data/projects";
import { TrackedLinksManager } from "@/components/tracked-links-manager";

export default async function LinksPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [links, projects] = await Promise.all([
    getTrackedLinks(),
    getAllProjectsForAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Links rastreáveis
      </h1>
      <div className="mt-8">
        <TrackedLinksManager links={links} projects={projects} />
      </div>
    </div>
  );
}
