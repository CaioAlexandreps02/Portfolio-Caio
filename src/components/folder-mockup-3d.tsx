"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useSpring, a, type SpringValue } from "@react-spring/three";
import { BackSide, RepeatWrapping } from "three";
import { driveImageProxyUrl } from "@/lib/drive";
import type { PrintMockup } from "@/types/database";

// Proporção A4 (210 x 297mm)
const PANEL_WIDTH = 1.41;
const PANEL_HEIGHT = 2;

// Dobra (dobradiça) fica sempre no meio do spread aberto. A página da
// direita (inner_right) é a âncora fixa; a da esquerda (inner_left) e a
// capa giram sobre essa dobra ao abrir/fechar, convergindo pro lado
// direito — onde a contra-capa mora (fixa, igual a âncora).
const HINGE_X = PANEL_WIDTH;
const ANCHOR_X = PANEL_WIDTH * 1.5;

/**
 * Artes de impressão vêm em alta resolução (300dpi, várias vezes >5MB) —
 * usar isso cru como textura 3D pode passar de 100MB de VRAM só nesses 4
 * painéis e derrubar a aba em GPUs mais fracas. Reaproveita o otimizador
 * de imagem do próprio Next.js pra baixar uma versão bem menor antes de
 * virar textura. 828 precisa ser um dos tamanhos em `images.deviceSizes`
 * (padrão do Next) — outro valor faz o otimizador devolver 400.
 */
function textureUrl(url: string): string {
  if (url.startsWith("data:")) return url;
  if (url.includes("drive.google.com")) return driveImageProxyUrl(url);
  return `/_next/image?url=${encodeURIComponent(url)}&w=828&q=75`;
}

/**
 * Painel que gira numa dobradiça (ou fica fixo, sem `hinge`). `pivotX` é
 * onde o grupo fica ancorado no mundo; `x`/`z` são o deslocamento do
 * painel dentro desse grupo. Usado tanto pras páginas internas quanto
 * pra capa (que gira igual uma página, terminando encostada atrás
 * quando aberta — por isso aparece por trás nesse estado, como a capa
 * de um livro de verdade aberto até o fim).
 *
 * Só renderiza de frente (lado padrão) — vendo por trás apareceria
 * espelhado, e o painel fixo/a contra-capa já cobrem a tela nos ângulos
 * onde isso importaria.
 */
function Panel({
  image,
  x,
  z = 0,
  pivotX = 0,
  hinge,
  invertHinge = false,
}: {
  image: string;
  x: number;
  z?: number;
  pivotX?: number;
  hinge?: SpringValue<number>;
  invertHinge?: boolean;
}) {
  const texture = useTexture(image);
  const mesh = (
    <mesh position={[x, 0, z]}>
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial map={texture} roughness={0.85} />
    </mesh>
  );

  if (!hinge) return <group position={[pivotX, 0, 0]}>{mesh}</group>;

  const rotationY = hinge.to(
    (p: number) => (invertHinge ? 1 - p : p) * Math.PI,
  );
  return (
    <a.group position={[pivotX, 0, 0]} rotation-y={rotationY}>
      {mesh}
    </a.group>
  );
}

/**
 * Contra-capa — fixa junto com a página âncora, virada pra trás (-Z) e
 * usando o lado de dentro do material (BackSide) pra só aparecer pra quem
 * orbitar a câmera por detrás — sem precisar rotacionar a malha. Ver algo
 * pelo lado de dentro de um plano sempre espelha a textura horizontalmente
 * (é assim que espelhos/vidro funcionam), então cancela isso invertendo o
 * eixo U da própria textura.
 *
 * Fica sempre visível (aberto ou fechado): por estar atrás de tudo, quem
 * olha de frente nunca a vê (a página âncora, mais perto da câmera,
 * cobre ela); só aparece pra quem orbitar a câmera pra trás.
 */
function BackCover({ image }: { image: string }) {
  const texture = useTexture(image);

  // Mutação imperativa intencional — é assim que se configura um
  // THREE.Texture depois de carregado, não é estado do React.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.needsUpdate = true;
  }, [texture]);
  /* eslint-enable react-hooks/immutability */

  return (
    <mesh position={[ANCHOR_X, 0, -0.02]}>
      <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
      <meshStandardMaterial map={texture} side={BackSide} roughness={0.85} />
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

  // Recentraliza o grupo: fechado, centraliza a âncora (onde tudo
  // converge); aberto, centraliza a dobra do meio do spread.
  const groupX = progress.to(
    (p: number) => -ANCHOR_X * p - PANEL_WIDTH * (1 - p),
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
        <Panel image={textureUrl(mockup.inner_right)} x={0} pivotX={ANCHOR_X} />
        <Panel
          image={textureUrl(mockup.inner_left)}
          x={-PANEL_WIDTH / 2}
          pivotX={HINGE_X}
          hinge={progress}
        />
        {/* A capa gira junto com a página interna esquerda, na mesma
         * dobra, só que na fase invertida: fechada (progress=1) fica
         * lisa cobrindo a âncora; aberta (progress=0) termina virada
         * 180°, encostada atrás — por isso passa a aparecer pra quem
         * orbita a câmera por trás, junto com a contra-capa. */}
        <Panel
          image={textureUrl(mockup.front_cover)}
          x={PANEL_WIDTH / 2}
          z={0.02}
          pivotX={HINGE_X}
          hinge={progress}
          invertHinge
        />
        <BackCover image={textureUrl(mockup.back_cover)} />
      </a.group>
    </>
  );
}

export function FolderMockup3D({
  mockup,
  variant = "default",
  open: controlledOpen,
  onOpenChange,
  showToggleButton = true,
}: {
  mockup: PrintMockup;
  variant?: "default" | "showcase";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showToggleButton?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isShowcase = variant === "showcase";
  const open = controlledOpen ?? uncontrolledOpen;

  function toggleOpen() {
    const nextOpen = !open;
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden [&_canvas]:!h-full [&_canvas]:!w-full ${
        isShowcase
          ? "rounded-[8px] bg-transparent"
          : "rounded-xl border border-border bg-surface"
      }`}
    >
      <Canvas camera={{ position: [0, 0, 4.2], fov: 40 }}>
        <Suspense fallback={null}>
          <Scene mockup={mockup} open={open} onToggle={toggleOpen} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
      {showToggleButton && (
        <button
          type="button"
          onClick={toggleOpen}
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold transition-colors ${
            isShowcase
              ? "rounded-[6px] border border-white/14 bg-primary px-5 py-3 text-primary-foreground shadow-[0_8px_20px_oklch(0.18_0.12_260/0.28)] hover:bg-accent hover:text-background"
              : "rounded-full bg-primary px-5 py-2 text-primary-foreground hover:opacity-90"
          }`}
        >
          {open ? "Fechar" : "Abrir"}
        </button>
      )}
    </div>
  );
}
