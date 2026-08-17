import Link from "next/link";
import { CaioPortoLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { getUser } from "@/lib/supabase/auth";

export async function Navbar() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/90">
      <nav className="mx-auto flex max-w-[92rem] items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="block text-foreground transition-colors hover:text-primary"
        >
          <CaioPortoLogo className="h-10 w-[9.8rem]" />
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          <Link
            href="/#projetos"
            className="text-base font-medium text-foreground transition-colors hover:text-primary"
          >
            Projetos
          </Link>
          <Link
            href="/sobre"
            className="text-base font-medium text-foreground transition-colors hover:text-primary"
          >
            Sobre
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/admin/projetos"
                className="hidden text-sm text-muted transition-colors hover:text-foreground lg:block"
              >
                Gerenciar projetos
              </Link>
              <Link
                href="/admin/configuracoes"
                className="hidden text-sm text-muted transition-colors hover:text-foreground lg:block"
              >
                Configuracoes
              </Link>
              <Link
                href="/admin/links"
                className="hidden text-sm text-muted transition-colors hover:text-foreground lg:block"
              >
                Links
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/sobre"
              className="hidden rounded-[4px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-background sm:inline-flex"
            >
              Falar comigo <span className="ml-3">-&gt;</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
