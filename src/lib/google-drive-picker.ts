"use client";

type GooglePickerBuilder = {
  addView: (view: unknown) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setCallback: (cb: (data: PickerResponse) => void) => GooglePickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};

type GoogleGlobal = {
  picker: {
    PickerBuilder: new () => GooglePickerBuilder;
    ViewId: { DOCS_IMAGES: unknown };
    Action: { PICKED: string; CANCEL: string };
  };
};

type PickerResponse = {
  action: string;
  docs: { id: string }[];
};

type GapiGlobal = {
  load: (api: string, callback: () => void) => void;
};

declare global {
  interface Window {
    google?: GoogleGlobal;
    gapi?: GapiGlobal;
  }
}

const GAPI_SRC = "https://apis.google.com/js/api.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
  });
}

let pickerApiLoaded: Promise<void> | null = null;

async function ensurePickerLoaded(): Promise<void> {
  if (pickerApiLoaded) return pickerApiLoaded;

  pickerApiLoaded = (async () => {
    await loadScript(GAPI_SRC);
    await new Promise<void>((resolve) => {
      window.gapi!.load("picker", () => resolve());
    });
  })();

  return pickerApiLoaded;
}

async function fetchAccessToken(): Promise<string> {
  const res = await fetch("/api/google/access-token");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Erro ao obter token de acesso do Google.");
  }
  return data.access_token;
}

async function makeFilePublic(fileId: string, accessToken: string) {
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );
}

function directViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Abre o seletor nativo do Google Drive usando a conexão persistente
 * (conectada em /admin/configuracoes — sem popup de consentimento aqui).
 * Deixa escolher uma imagem, torna o arquivo público ("qualquer um com o
 * link") e devolve a URL direta pronta pra salvar.
 */
export async function openDrivePicker(): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Google Drive Picker não configurado (falta a API key no ambiente).",
    );
  }

  const accessToken = await fetchAccessToken();
  await ensurePickerLoaded();
  const google = window.google!;

  return new Promise((resolve) => {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS_IMAGES)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setCallback(async (data) => {
        if (data.action === google.picker.Action.PICKED) {
          const fileId = data.docs[0].id;
          try {
            await makeFilePublic(fileId, accessToken);
          } catch {
            // segue mesmo se não conseguir alterar a permissão — o Caio
            // pode precisar compartilhar manualmente nesse caso raro
          }
          resolve(directViewUrl(fileId));
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}
