"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { driveImageProxyUrl } from "@/lib/drive";

export function Gallery({ images }: { images: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrevious = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrevious();
      if (e.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, close, showPrevious, showNext]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-video w-56 shrink-0 snap-start overflow-hidden rounded-lg bg-surface"
          >
            <Image
              src={driveImageProxyUrl(url)}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute top-6 right-6 text-3xl text-white/80 hover:text-white"
          >
            ×
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrevious();
              }}
              aria-label="Imagem anterior"
              className="absolute left-4 text-4xl text-white/80 hover:text-white"
            >
              ‹
            </button>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={driveImageProxyUrl(images[openIndex])}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Próxima imagem"
              className="absolute right-4 text-4xl text-white/80 hover:text-white"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
