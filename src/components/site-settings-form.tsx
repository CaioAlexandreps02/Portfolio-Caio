"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/types/database";
import { driveShareLinkToDirectUrl } from "@/lib/drive";
import { updateSiteSettings } from "@/lib/actions/site-settings";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "text-sm text-muted";

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const router = useRouter();
  const [bio, setBio] = useState(settings?.about_bio ?? "");
  const [photoInput, setPhotoInput] = useState(settings?.about_photo_url ?? "");
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_number ?? "");
  const [linkedin, setLinkedin] = useState(settings?.linkedin_url ?? "");
  const [email, setEmail] = useState(settings?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      await updateSiteSettings({
        about_bio: bio || null,
        about_photo_url: photoInput
          ? driveShareLinkToDirectUrl(photoInput)
          : null,
        whatsapp_number: whatsapp || null,
        linkedin_url: linkedin || null,
        email: email || null,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className={labelClass}>
          Bio da página &quot;Sobre&quot;
        </label>
        <textarea
          id="bio"
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo" className={labelClass}>
          Foto (link de compartilhamento do Google Drive)
        </label>
        <input
          id="photo"
          value={photoInput}
          onChange={(e) => setPhotoInput(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="whatsapp" className={labelClass}>
          WhatsApp (com DDI e DDD, só números)
        </label>
        <input
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="5541999999999"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="linkedin" className={labelClass}>
          LinkedIn
        </label>
        <input
          id="linkedin"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          E-mail de contato
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-primary">Salvo com sucesso.</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
