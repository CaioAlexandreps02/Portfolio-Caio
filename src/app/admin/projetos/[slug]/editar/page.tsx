import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { getProjectBySlug } from "@/lib/data/projects";
import { ProjectForm } from "@/components/project-form";

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar projeto
      </h1>
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
