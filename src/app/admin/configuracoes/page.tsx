import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getPublishedProjects } from "@/lib/data/projects";
import { getGoogleDriveConnectionStatus } from "@/lib/google/connection";
import { getFileName, getValidAccessToken } from "@/lib/google/drive-api";
import { SiteSettingsForm } from "@/components/site-settings-form";
import { FeaturedOrderList } from "@/components/featured-order-list";
import { GoogleDriveConnectionCard } from "@/components/google-drive-connection-card";
import { GoogleDriveRootFolderForm } from "@/components/google-drive-root-folder-form";

export default async function ConfiguracoesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [settings, projects, googleDrive] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
    getGoogleDriveConnectionStatus(),
  ]);
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => a.sort_order - b.sort_order);

  const rootFolderId = settings?.google_drive_root_folder_id ?? null;
  let rootFolderName: string | null = null;
  if (googleDrive.connected && rootFolderId) {
    try {
      const accessToken = await getValidAccessToken();
      rootFolderName = await getFileName(rootFolderId, accessToken);
    } catch {
      rootFolderName = null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Integrações
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <Suspense fallback={null}>
            <GoogleDriveConnectionCard
              connected={googleDrive.connected}
              connectedAt={googleDrive.connectedAt}
            />
          </Suspense>
          <GoogleDriveRootFolderForm
            folderId={rootFolderId}
            folderName={rootFolderName}
            driveConnected={googleDrive.connected}
          />
        </div>
      </section>

      <section className="mt-12">
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
