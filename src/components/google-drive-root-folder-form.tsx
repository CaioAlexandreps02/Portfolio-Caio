"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { driveShareLinkToFolderId } from "@/lib/drive";
import { updateGoogleDriveRootFolder } from "@/lib/actions/site-settings";

export function GoogleDriveRootFolderForm({
  folderId,
}: {
  folderId: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(folderId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateGoogleDriveRootFolder(
        value ? driveShareLinkToFolderId(value) : null,
      );
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1.5 rounded-lg border border-border p-4"
    >
      <label htmlFor="root-folder" className="text-sm font-medium">
        Pasta raiz do Google Drive
      </label>
      <p className="text-xs text-muted">
        Link de compartilhamento da pasta em que o navegador de arquivos do
        editor de mockup fica travado (não deixa sair dela nem das
        subpastas).
      </p>
      <div className="mt-2 flex gap-2">
        <input
          id="root-folder"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-primary">Salvo com sucesso.</p>
      )}
    </form>
  );
}
