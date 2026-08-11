"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { disconnectGoogleDrive } from "@/lib/actions/google-drive";

const ERROR_MESSAGES: Record<string, string> = {
  state_invalido:
    "Sessão de autorização expirada ou inválida. Tente conectar novamente.",
  autorizacao_negada: "Autorização negada no Google.",
  sem_refresh_token:
    "O Google não devolveu permissão de acesso contínuo. Se já tinha autorizado antes, remova o acesso em myaccount.google.com/permissions e tente conectar de novo.",
  falha_na_troca: "Falha ao trocar o código de autorização por tokens.",
};

export function GoogleDriveConnectionCard({
  connected,
  connectedAt,
}: {
  connected: boolean;
  connectedAt: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleError = searchParams.get("google_error");
  const justConnected = searchParams.get("google_connected") === "1";

  async function handleDisconnect() {
    if (!confirm("Desconectar o Google Drive?")) return;
    setDisconnecting(true);
    setError(null);
    try {
      await disconnectGoogleDrive();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao desconectar.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Google Drive</p>
          <p className="text-xs text-muted">
            {connected
              ? `Conectado${
                  connectedAt
                    ? " desde " +
                      new Date(connectedAt).toLocaleDateString("pt-BR")
                    : ""
                }`
              : "Não conectado — necessário pro editor do mockup de folder"}
          </p>
        </div>

        {connected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="shrink-0 text-sm text-danger hover:underline disabled:opacity-50"
          >
            {disconnecting ? "Desconectando..." : "Desconectar"}
          </button>
        ) : (
          <a
            href="/api/auth/google/start"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Conectar Google Drive
          </a>
        )}
      </div>

      {justConnected && (
        <p className="text-sm text-primary">Conectado com sucesso.</p>
      )}
      {googleError && (
        <p className="text-sm text-danger">
          {ERROR_MESSAGES[googleError] ?? "Erro ao conectar."}
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
