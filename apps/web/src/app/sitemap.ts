import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'http://localhost:3000';
  const locales = ['hy', 'en', 'ru'];
  const paths = ['', '/gyms', '/privacy', '/terms'];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    })),
  );
}
