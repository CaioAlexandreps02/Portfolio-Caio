import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { getUser } from "@/lib/supabase/auth";

export async function Navbar() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Caio Porto
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/#projetos"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Projetos
          </Link>
          <Link
            href="/sobre"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Sobre
          </Link>
          {user ? (
            <>
              <Link
                href="/admin/configuracoes"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Configurações
              </Link>
              <Link
                href="/admin/links"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Links
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
