import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/site-settings";

const BIO_PADRAO = `Profissional de Marketing com atuação em design gráfico, vídeo, social
media, sistemas e desenvolvimento de sites.

Ferramentas: Figma, Premiere, After Effects, Next.js, Supabase.`;

export const metadata: Metadata = {
  title: "Sobre",
  description: "Trajetória, habilidades e ferramentas de Caio Porto.",
};

export default async function SobrePage() {
  const settings = await getSiteSettings();
  const bio = settings?.about_bio ?? BIO_PADRAO;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Sobre mim</h1>

      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-surface">
          {settings?.about_photo_url && (
            <Image
              src={settings.about_photo_url}
              alt="Foto de Caio Porto"
              fill
              className="object-cover"
            />
          )}
        </div>
        <p className="whitespace-pre-line text-muted">{bio}</p>
      </div>
    </div>
  );
}
