/**
 * Converte um link de compartilhamento do Google Drive
 * (.../file/d/FILE_ID/view?usp=sharing ou ?id=FILE_ID) pro formato de
 * visualização direta usado nas imagens do site. Se não reconhecer o
 * formato, devolve a URL original sem alterar.
 */
export function driveShareLinkToDirectUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const fileIdMatch =
    trimmed.match(/\/file\/d\/([^/]+)/) ?? trimmed.match(/[?&]id=([^&]+)/);

  if (!fileIdMatch) return trimmed;

  return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
}
