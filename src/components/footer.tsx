import type { SiteSettings } from "@/types/database";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const whatsapp = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Caio Porto</p>
        <div className="flex gap-5">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              WhatsApp
            </a>
          )}
          {settings?.linkedin_url && (
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
          )}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="transition-colors hover:text-foreground"
            >
              E-mail
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
