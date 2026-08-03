/**
 * Converte um link comum do YouTube (watch?v=, youtu.be/, shorts/) pro
 * formato de embed. Se já for embed ou não reconhecer o formato, devolve
 * a URL original.
 */
export function toYoutubeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }

  return trimmed;
}
