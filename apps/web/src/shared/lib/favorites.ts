export const FAVORITES_STORAGE_KEY = 'gymhub_favorites';
export const FAVORITES_CHANGED_EVENT = 'gymhub:favorites-changed';

export function readFavoriteSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function writeFavoriteSlugs(slugs: string[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}

export function toggleFavoriteSlug(slug: string): boolean {
  const list = readFavoriteSlugs();
  const next = list.includes(slug)
    ? list.filter((item) => item !== slug)
    : [...list, slug];
  writeFavoriteSlugs(next);
  return next.includes(slug);
}
