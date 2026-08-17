import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/auth";
import { getAllProjects } from "@/lib/data/projects";
import { AdminProjectsList } from "@/components/admin-projects-list";

export default async function AdminProjetosPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const projects = await getAllProjects();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
        <Link
          href="/admin/projetos/novo"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Novo projeto
        </Link>
      </div>
      <div className="mt-8">
        <AdminProjectsList projects={projects} />
      </div>
    </div>
  );
}
