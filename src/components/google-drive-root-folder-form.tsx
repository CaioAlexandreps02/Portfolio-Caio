"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DriveFolderBrowserModal } from "@/components/drive-folder-browser-modal";
import { updateGoogleDriveRootFolder } from "@/lib/actions/site-settings";

export function GoogleDriveRootFolderForm({
  folderId,
  folderName,
  driveConnected,
}: {
  folderId: string | null;
  folderName: string | null;
  driveConnected: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(folder: { id: string; name: string }) {
    setOpen(false);
    setSaving(true);
    setError(null);
    try {
      await updateGoogleDriveRootFolder(folder.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Pasta raiz do Google Drive</p>
      <p className="text-xs text-muted">
        Pasta em que o navegador de arquivos do editor de mockup fica
        travado (não deixa sair dela nem das subpastas).
      </p>

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-sm">
          {folderId ? (
            <>
              Pasta atual:{" "}
              <span className="font-medium">{folderName ?? folderId}</span>
            </>
          ) : (
            <span className="text-muted">Nenhuma pasta selecionada.</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!driveConnected || saving}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando..." : folderId ? "Trocar pasta" : "Selecionar pasta"}
        </button>
      </div>

      {!driveConnected && (
        <p className="text-sm text-danger">
          Conecte o Google Drive acima antes de selecionar a pasta raiz.
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      {open && (
        <DriveFolderBrowserModal
          mode="folder"
          rootFolderId="root"
          onClose={() => setOpen(false)}
          onSelectFolder={handleSelect}
        />
      )}
    </div>
  );
}
