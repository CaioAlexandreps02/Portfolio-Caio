"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  Folder,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";

type DriveItem = { id: string; name: string; isFolder: boolean };
type Crumb = { id: string; name: string };

export function DriveFolderBrowserModal({
  mode = "file",
  rootFolderId,
  onClose,
  onSelectFile,
  onSelectFolder,
}: {
  mode?: "file" | "folder";
  /** Pasta em que a navegação começa. Passe "root" pra navegar o Drive
   * inteiro (usado ao escolher a pasta raiz). Se omitido, usa a pasta raiz
   * já configurada em Configurações (navegação travada nela). */
  rootFolderId?: string;
  onClose: () => void;
  onSelectFile?: (url: string) => void;
  onSelectFolder?: (folder: { id: string; name: string }) => void;
}) {
  const [stack, setStack] = useState<Crumb[]>([]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentFolder = stack[stack.length - 1];

  async function fetchItems(folderId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/google/drive/list?folderId=${folderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao listar pasta.");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao listar pasta.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = rootFolderId
          ? `/api/google/drive/list?folderId=${rootFolderId}`
          : "/api/google/drive/list";
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Erro ao carregar pasta raiz.");
        setStack([
          { id: data.folderId, name: rootFolderId ? "Meu Drive" : "Início" },
        ]);
        setItems(data.items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar pasta raiz.",
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openFolder(item: DriveItem) {
    setStack((prev) => [...prev, { id: item.id, name: item.name }]);
    fetchItems(item.id);
  }

  function goBack() {
    if (stack.length <= 1) return;
    const previous = stack[stack.length - 2];
    setStack((prev) => prev.slice(0, -1));
    fetchItems(previous.id);
  }

  async function selectFile(item: DriveItem) {
    setSelecting(item.id);
    setError(null);
    try {
      const res = await fetch("/api/google/drive/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao selecionar arquivo.");
      onSelectFile?.(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao selecionar arquivo.",
      );
    } finally {
      setSelecting(null);
    }
  }

  function selectCurrentFolder() {
    if (currentFolder) onSelectFolder?.(currentFolder);
  }

  function handleItemClick(item: DriveItem) {
    if (item.isFolder) {
      openFolder(item);
    } else if (mode === "file") {
      selectFile(item);
    }
  }

  const visibleItems = mode === "folder" ? items.filter((i) => i.isFolder) : items;

  return createPortal(
    <div className="animate-modal-fade fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="animate-modal-pop flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <HardDrive className="size-5 text-muted" />
            <h3 className="text-base font-bold text-foreground">
              {mode === "folder" ? "Selecionar pasta" : "Escolher do Google Drive"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted transition hover:bg-background hover:text-foreground active:scale-90"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-5 py-2.5 text-sm">
          {stack.length > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="group flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold text-muted transition hover:bg-background active:scale-95"
            >
              <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Voltar
            </button>
          )}
          {currentFolder && (
            <span
              key={currentFolder.id}
              className="animate-modal-fade truncate font-semibold text-muted"
            >
              {currentFolder.name}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="animate-modal-fade flex items-center justify-center gap-2 py-8 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" />
              Carregando...
            </div>
          ) : error ? (
            <p className="animate-modal-fade py-8 text-center text-sm text-danger">
              {error}
            </p>
          ) : visibleItems.length === 0 ? (
            <p className="animate-modal-fade py-8 text-center text-sm text-muted">
              {mode === "folder" ? "Nenhuma subpasta." : "Pasta vazia."}
            </p>
          ) : (
            <div
              key={currentFolder?.id}
              className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
            >
              {visibleItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={selecting !== null}
                  onClick={() => handleItemClick(item)}
                  style={{ animationDelay: `${Math.min(index, 20) * 25}ms` }}
                  className="animate-modal-rise group flex flex-col gap-1.5 rounded-xl text-left transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-background transition-colors duration-200 group-hover:border-primary/60 group-hover:shadow-md">
                    {item.isFolder ? (
                      <Folder className="size-8 text-muted transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                      <>
                        <ImageIcon className="size-8 text-muted" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/google/drive/thumbnail?fileId=${item.id}`}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => e.currentTarget.remove()}
                        />
                      </>
                    )}

                    {selecting === item.id && (
                      <div className="animate-modal-fade absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="size-5 animate-spin text-primary" />
                      </div>
                    )}

                    {!item.isFolder && mode === "file" && !selecting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <span className="scale-90 rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-foreground transition-transform duration-200 group-hover:scale-100">
                          Usar
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="truncate px-0.5 text-xs font-semibold text-foreground">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === "folder" && (
          <div className="flex items-center justify-end border-t border-border px-5 py-3">
            <button
              type="button"
              onClick={selectCurrentFolder}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95"
            >
              Selecionar esta pasta
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
