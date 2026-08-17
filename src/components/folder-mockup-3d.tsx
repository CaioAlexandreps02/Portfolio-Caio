"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useSpring, a, type SpringValue } from "@react-spring/three";
import { BackSide, RepeatWrapping, type Mesh, type MeshStandardMaterial } from "three";
import type { PrintMockup } from "@/types/database";

// Proporção A4 (210 x 297mm)
const PANEL_WIDTH = 1.41;
const PANEL_HEIGHT = 2;

/**
 * Artes de impressão vêm em alta resolução (300dpi, várias vezes >5MB) —
 * usar isso cru como textura 3D pode passar de 100MB de VRAM só nesses 4
 * painéis e derrubar a aba em GPUs mais fracas. Reaproveita o otimizador
 * de imagem do próprio Next.js pra baixar uma versão bem menor antes de
 * virar textura. 828 precisa ser um dos tamanhos em `images.deviceSizes`
 * (padrão do Next) — outro valor faz o otimizador devolver 400.
 */
function textureUrl(url: string): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=828&q=75`;
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
}: {
  image: string;
  progress: SpringValue<number>;
}) {
  const texture = useTexture(image);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    if (!materialRef.current || !meshRef.current) return;
    const p = progress.get();
    materialRef.current.opacity = p;
    meshRef.current.scale.setScalar(p > 0.05 ? 1 : 0);
  });

  return (
    <mesh ref={meshRef} position={[PANEL_WIDTH / 2, 0, 0.02]}>
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
 * Contra-capa — mesma posição/orientação da capa, só que atrás (-Z) e
 * usando o lado de dentro do material (BackSide) pra só aparecer pra quem
 * orbitar a câmera por detrás — sem precisar rotacionar a malha. Ver algo
 * pelo lado de dentro de um plano sempre espelha a textura horizontalmente
 * (é assim que espelhos/vidro funcionam), então cancela isso invertendo o
 * eixo U da própria textura.
 */
function BackCover({
  image,
  progress,
}: {
  image: string;
  progress: SpringValue<number>;
}) {
  const texture = useTexture(image);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  // Mutação imperativa intencional — é assim que se configura um
  // THREE.Texture depois de carregado, não é estado do React.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.needsUpdate = true;
  }, [texture]);
  /* eslint-enable react-hooks/immutability */

  useFrame(() => {
    if (!materialRef.current || !meshRef.current) return;
    const p = progress.get();
    materialRef.current.opacity = p;
    meshRef.current.scale.setScalar(p > 0.05 ? 1 : 0);
  });

  return (
    <mesh ref={meshRef} position={[PANEL_WIDTH / 2, 0, -0.02]}>
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        side={BackSide}
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

  // Distingue clique de arrasto (orbitar a câmera) — sem isso, soltar o
  // mouse depois de girar a câmera em cima do folder também alterna
  // aberto/fechado, porque o pointerup acontece sobre a malha.
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    const start = pointerDownPos.current;
    pointerDownPos.current = null;
    if (!start) return;
    const distance = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (distance < 5) onToggle();
  }

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <a.group
        position-x={groupX}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <InnerPanel image={textureUrl(mockup.inner_left)} x={PANEL_WIDTH / 2} />
        <group position={[PANEL_WIDTH, 0, 0]}>
          <InnerPanel
            image={textureUrl(mockup.inner_right)}
            x={PANEL_WIDTH / 2}
            hinge={progress}
          />
        </group>
        <FrontCover image={textureUrl(mockup.front_cover)} progress={progress} />
        <BackCover image={textureUrl(mockup.back_cover)} progress={progress} />
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
