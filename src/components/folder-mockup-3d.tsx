"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useSpring, a, type SpringValue } from "@react-spring/three";
import type { Mesh, MeshStandardMaterial } from "three";
import type { PrintMockup } from "@/types/database";

// Proporção A4 (210 x 297mm)
const PANEL_WIDTH = 1.41;
const PANEL_HEIGHT = 2;

/**
 * Artes de impressão vêm em alta resolução (300dpi, várias vezes >5MB) —
 * usar isso cru como textura 3D pode passar de 100MB de VRAM só nesses 4
 * painéis e derrubar a aba em GPUs mais fracas. Reaproveita o otimizador
 * de imagem do próprio Next.js pra baixar uma versão bem menor antes de
 * virar textura.
 */
function textureUrl(url: string): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=1024&q=75`;
}

/** Painel interno (aberto) — inner_left é a âncora fixa, inner_right dobra sobre ela ao fechar. */
function InnerPanel({
  image,
  x,
  hinge,
}: {
  image: string;
  x: number;
  hinge?: SpringValue<number>;
}) {
  const texture = useTexture(image);
  const mesh = (
    <mesh position={[x, 0, 0]}>
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial map={texture} side={2} roughness={0.85} />
    </mesh>
  );

  if (!hinge) return mesh;

  const rotationY = hinge.to((p: number) => p * Math.PI);
  return <a.group rotation-y={rotationY}>{mesh}</a.group>;
}

/** Capa (fechado) — visível de frente, some ao abrir. */
function FrontCover({
  image,
  progress,
  onToggle,
}: {
  image: string;
  progress: SpringValue<number>;
  onToggle: () => void;
}) {
  const texture = useTexture(image);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const p = progress.get();
    materialRef.current!.opacity = p;
    meshRef.current!.scale.setScalar(p > 0.05 ? 1 : 0);
  });

  return (
    <mesh ref={meshRef} position={[PANEL_WIDTH / 2, 0, 0.02]} onClick={onToggle}>
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        side={2}
        roughness={0.85}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

/**
 * Contra-capa — mesma posição da capa, virada pra trás (-Z). Só aparece pra
 * quem orbitar a câmera pra olhar o mockup por detrás; invisível de frente
 * porque usa o lado padrão (FrontSide) já rotacionado 180°.
 */
function BackCover({
  image,
  progress,
  onToggle,
}: {
  image: string;
  progress: SpringValue<number>;
  onToggle: () => void;
}) {
  const texture = useTexture(image);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const p = progress.get();
    materialRef.current!.opacity = p;
    const visible = p > 0.05;
    // escala.x negativa cancela o espelhamento da rotação de 180° no Y
    meshRef.current!.scale.set(visible ? -1 : 0, visible ? 1 : 0, 1);
  });

  return (
    <mesh
      ref={meshRef}
      position={[PANEL_WIDTH / 2, 0, -0.02]}
      rotation={[0, Math.PI, 0]}
      onClick={onToggle}
    >
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        roughness={0.85}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function Scene({
  mockup,
  open,
  onToggle,
}: {
  mockup: PrintMockup;
  open: boolean;
  onToggle: () => void;
}) {
  const { progress } = useSpring({
    progress: open ? 0 : 1,
    config: { mass: 2, tension: 170, friction: 26 },
  });

  const totalWidth = PANEL_WIDTH * 2;
  const groupX = progress.to(
    (p: number) =>
      -PANEL_WIDTH / 2 - (totalWidth - PANEL_WIDTH) * (1 - p) * 0.5,
  );

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <a.group position-x={groupX} onClick={onToggle}>
        <InnerPanel image={textureUrl(mockup.inner_left)} x={PANEL_WIDTH / 2} />
        <group position={[PANEL_WIDTH, 0, 0]}>
          <InnerPanel
            image={textureUrl(mockup.inner_right)}
            x={PANEL_WIDTH / 2}
            hinge={progress}
          />
        </group>
        <FrontCover
          image={textureUrl(mockup.front_cover)}
          progress={progress}
          onToggle={onToggle}
        />
        <BackCover
          image={textureUrl(mockup.back_cover)}
          progress={progress}
          onToggle={onToggle}
        />
      </a.group>
    </>
  );
}

export function FolderMockup3D({ mockup }: { mockup: PrintMockup }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface [&_canvas]:!h-full [&_canvas]:!w-full">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 40 }}>
        <Suspense fallback={null}>
          <Scene mockup={mockup} open={open} onToggle={() => setOpen((v) => !v)} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {open ? "Fechar" : "Abrir"}
      </button>
    </div>
  );
}
