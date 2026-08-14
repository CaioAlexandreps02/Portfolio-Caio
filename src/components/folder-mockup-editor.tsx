"use client";

import { useState } from "react";
import Image from "next/image";
import { DriveFolderBrowserModal } from "@/components/drive-folder-browser-modal";
import type { PrintMockup } from "@/types/database";

type Slot = keyof PrintMockup;
type PartialMockup = Partial<Record<Slot, string>>;

const ROWS: { title: string; slots: { key: Slot; label: string }[] }[] = [
  {
    title: "Vista fechada (fora)",
    slots: [
      { key: "back_cover", label: "Contra-capa" },
      { key: "front_cover", label: "Capa" },
    ],
  },
  {
    title: "Vista aberta (dentro)",
    slots: [
      { key: "inner_left", label: "Interna Esquerda" },
      { key: "inner_right", label: "Interna Direita" },
    ],
  },
];

export function FolderMockupEditor({
  value,
  onChange,
}: {
  value: PartialMockup;
  onChange: (next: PartialMockup) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);

  function handleSelect(url: string) {
    if (activeSlot) onChange({ ...value, [activeSlot]: url });
    setActiveSlot(null);
  }

  function handleClear(slot: Slot) {
    onChange({ ...value, [slot]: "" });
  }

  return (
    <div className="flex flex-col gap-4">
      {ROWS.map((row) => (
        <div key={row.title}>
          <p className="mb-2 text-xs text-muted">{row.title}</p>
          <div className="grid grid-cols-2 gap-3">
            {row.slots.map(({ key, label }) => (
              <SlotBox
                key={key}
                label={label}
                value={value[key]}
                onPick={() => setActiveSlot(key)}
                onClear={() => handleClear(key)}
              />
            ))}
          </div>
        </div>
      ))}

      {activeSlot && (
        <DriveFolderBrowserModal
          onClose={() => setActiveSlot(null)}
          onSelectFile={handleSelect}
        />
      )}
    </div>
  );
}

function SlotBox({
  label,
  value,
  onPick,
  onClear,
}: {
  label: string;
  value?: string;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="relative aspect-[0.707] overflow-hidden rounded-lg border border-dashed border-border bg-background">
      {value ? (
        <>
          <Image src={value} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remover ${label}`}
            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            ×
          </button>
          <span className="absolute bottom-1.5 left-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[10px] text-muted">
            {label}
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted transition-colors hover:text-primary"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">{label}</span>
        </button>
      )}
    </div>
  );
}
