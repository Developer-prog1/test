'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueries } from '@tanstack/react-query';
import { Link } from '../../../i18n/navigation';
import { apiFetch } from '../../../shared/api/client';
import {
  FAVORITES_CHANGED_EVENT,
  readFavoriteSlugs,
  toggleFavoriteSlug,
} from '../../../shared/lib/favorites';
import { Reveal } from '../../../shared/ui/reveal';
import { SafeImage } from '../../../shared/ui/safe-image';

type FavoriteGym = {
  id: string;
  slug: string;
  name: string;
  district: string | null;
  city: string;
  isFeatured: boolean;
  verified: boolean;
  amenities: string[];
  media: { url: string }[];
  plans: { priceAmd: number }[];
};

const DISTRICT_KEYS = [
  'Kentron',
  'Arabkir',
  'Ajapnyak',
  'Avan',
  'Davtashen',
  'Erebuni',
  'Kanaker-Zeytun',
  'Malatia-Sebastia',
  'Nor Nork',
  'Nork-Marash',
  'Nubarashen',
  'Shengavit',
] as const;

type DistrictKey = (typeof DISTRICT_KEYS)[number];

function isDistrictKey(value: string): value is DistrictKey {
  return (DISTRICT_KEYS as readonly string[]).includes(value);
}

export default function FavoritesPage() {
  const t = useTranslations('favoritesPage');
  const g = useTranslations('gyms');
  const tCommon = useTranslations('common');
  const tDistricts = useTranslations('districts');
  const tAmenities = useTranslations('amenities');
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      setSlugs(readFavoriteSlugs());
    }

    sync();
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const queries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['favorite-gym', slug],
      queryFn: () => apiFetch<FavoriteGym>(`/gyms/${slug}`),
      enabled: Boolean(slug),
      retry: false,
    })),
  });

  const isLoading = slugs.length > 0 && queries.some((query) => query.isLoading);

  return (
    <div className="container-shell py-12 sm:py-16">
      <Reveal>
        <p className="eyebrow">{t('title')}</p>
        <h1 className="display mt-3 text-4xl font-bold sm:text-6xl">{t('title')}</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">{t('subtitle')}</p>
      </Reveal>

      {!slugs.length ? (
        <Reveal delay={0.1} className="mt-12">
          <div className="card-glass flex flex-col items-start gap-5 p-8 sm:p-10">
            <p className="text-lg text-[var(--muted)]">{t('empty')}</p>
            <Link href="/gyms" className="btn btn-primary">
              {t('emptyCta')}
            </Link>
          </div>
        </Reveal>
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-[var(--muted)]">{g('loading')}</p>
      ) : null}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug, index) => {
          const query = queries[index];
          const gym = query?.data;

          if (query?.isError) {
            return (
              <Reveal key={slug} delay={Math.min(index * 0.08, 0.4)}>
                <article className="card-glass flex min-h-[220px] flex-col justify-between p-5">
                  <div>
                    <p className="display text-xl font-semibold">{slug}</p>
                    <p className="mt-2 text-sm text-[var(--accent-hot)]">
                      {t('unavailable')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost self-start !px-3 !py-2 text-xs"
                    onClick={() => toggleFavoriteSlug(slug)}
                  >
                    {t('remove')}
                  </button>
                </article>
              </Reveal>
            );
          }

          if (!gym) return null;

          const districtLabel = gym.district
            ? isDistrictKey(gym.district)
              ? tDistricts(gym.district)
              : gym.district
            : gym.city === 'Yerevan'
              ? tCommon('yerevan')
              : gym.city;
          const amenityLabels = gym.amenities.slice(0, 3).map((code) => {
            try {
              return tAmenities(code as 'parking');
            } catch {
              return code;
            }
          });

          return (
            <Reveal key={gym.id} delay={Math.min(index * 0.08, 0.4)}>
              <article className="card-glass group relative overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]">
                <Link href={`/gyms/${gym.slug}`} className="block">
                  <div className="relative aspect-[16/11] bg-[var(--surface)]">
                    <div className="absolute inset-0 overflow-hidden">
                      <SafeImage
                        src={gym.media[0]?.url}
                        alt={gym.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    </div>
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                      {gym.isFeatured ? (
                        <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-black">
                          {tCommon('featured')}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] uppercase leading-none tracking-wide text-white">
                        {g('verified')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 p-4 pb-14">
                    <h2 className="display text-xl font-semibold sm:text-2xl">
                      {gym.name}
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                      {districtLabel}
                      {gym.plans[0]
                        ? ` · ${g('from')} ${gym.plans[0].priceAmd.toLocaleString()} ${tCommon('currency')}`
                        : ''}
                    </p>
                    {amenityLabels.length ? (
                      <p className="line-clamp-1 text-xs text-[rgba(214,255,62,0.75)]">
                        {amenityLabels.join(' · ')}
                      </p>
                    ) : null}
                  </div>
                </Link>
                <button
                  type="button"
                  className="absolute bottom-4 right-4 rounded-full border border-[var(--line)] bg-black/50 px-3 py-1.5 text-xs font-medium text-[var(--muted)] backdrop-blur transition hover:border-[rgba(255,90,47,0.45)] hover:text-[var(--accent-hot)]"
                  onClick={() => toggleFavoriteSlug(gym.slug)}
                >
                  {t('remove')}
                </button>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
