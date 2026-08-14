"use client";

import { useEffect, useState } from "react";

type DriveItem = { id: string; name: string; isFolder: boolean };
type Crumb = { id: string; name: string };

export function DriveFolderBrowserModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
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
        const res = await fetch("/api/google/drive/list");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Erro ao carregar pasta raiz.");
        setStack([{ id: data.folderId, name: "Início" }]);
        setItems(data.items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar pasta raiz.",
        );
      } finally {
        setLoading(false);
      }
    })();
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
      onSelect(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao selecionar arquivo.",
      );
    } finally {
      setSelecting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-border bg-surface p-4">
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

        <div className="mt-4 flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-muted">Carregando...</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted">Pasta vazia.</p>
          )}
          {!loading && !error && (
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={selecting !== null}
                    onClick={() =>
                      item.isFolder ? openFolder(item) : selectFile(item)
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-background disabled:opacity-50"
                  >
                    <span className="text-base">
                      {item.isFolder ? "📁" : "🖼️"}
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>
                    {selecting === item.id && (
                      <span className="text-xs text-muted">
                        Selecionando...
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
