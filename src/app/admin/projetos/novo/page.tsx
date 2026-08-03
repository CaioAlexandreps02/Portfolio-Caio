import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { ProjectForm } from "@/components/project-form";

export default async function NovoProjetoPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Novo projeto</h1>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
