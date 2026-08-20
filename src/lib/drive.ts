/**
 * Converte um link de compartilhamento do Google Drive
 * (.../file/d/FILE_ID/view?usp=sharing ou ?id=FILE_ID) pro formato de
 * visualização direta usado nas imagens do site. Se não reconhecer o
 * formato, devolve a URL original sem alterar.
 */
export function driveShareLinkToDirectUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const fileId = extractDriveFileId(trimmed);

  if (!fileId) return trimmed;

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function extractDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  const fileIdMatch =
    trimmed.match(/\/file\/d\/([^/?#]+)/) ??
    trimmed.match(/[?&]id=([^&#]+)/);

  return fileIdMatch?.[1] ?? null;
}

export function driveImageProxyUrl(url: string): string {
  if (url.startsWith("data:") || url.startsWith("/")) return url;

  const fileId = extractDriveFileId(url);
  if (!fileId) return url;

  return `/api/google/drive/image?fileId=${encodeURIComponent(fileId)}`;
}
