"use client";

import { useEffect, useState } from "react";

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

  function goToCrumb(index: number) {
    setStack((prev) => prev.slice(0, index + 1));
    fetchItems(stack[index].id);
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
    const current = stack[stack.length - 1];
    if (current) onSelectFolder?.(current);
  }

  function handleItemClick(item: DriveItem) {
    if (item.isFolder) {
      openFolder(item);
    } else if (mode === "file") {
      selectFile(item);
    }
  }

  const visibleItems = mode === "folder" ? items.filter((i) => i.isFolder) : items;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {stack.map((crumb, index) => (
              <span key={crumb.id} className="flex items-center gap-1">
                {index > 0 && <span className="text-muted">/</span>}
                {index === stack.length - 1 ? (
                  <span className="font-medium">{crumb.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToCrumb(index)}
                    className="text-muted hover:text-primary"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-muted hover:text-foreground"
          >
            ×
          </button>
        </div>

        {mode === "folder" && (
          <button
            type="button"
            onClick={selectCurrentFolder}
            className="mt-3 self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Selecionar esta pasta
          </button>
        )}

        <div className="mt-4 flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-muted">Carregando...</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          {!loading && !error && visibleItems.length === 0 && (
            <p className="text-sm text-muted">
              {mode === "folder" ? "Nenhuma subpasta." : "Pasta vazia."}
            </p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={selecting !== null}
                  onClick={() => handleItemClick(item)}
                  className="flex flex-col items-center gap-1.5 rounded-lg p-2 text-center hover:bg-background disabled:opacity-50"
                >
                  <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-background text-2xl">
                    {item.isFolder ? (
                      "📁"
                    ) : (
                      <>
                        <span>🖼️</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/google/drive/thumbnail?fileId=${item.id}`}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => e.currentTarget.remove()}
                        />
                      </>
                    )}
                  </span>
                  <span className="w-full truncate text-xs">{item.name}</span>
                  {selecting === item.id && (
                    <span className="text-[10px] text-muted">
                      Selecionando...
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
