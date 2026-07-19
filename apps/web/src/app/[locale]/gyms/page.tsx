'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { YEREVAN_DISTRICTS, AMENITIES } from '@gymhub/shared';
import { apiFetch } from '../../../shared/api/client';
import { usePathname, useRouter } from '../../../i18n/navigation';
import { GymCard } from '../../../shared/ui/gym-card';
import { DarkSelect } from '../../../shared/ui/dark-select';
import { Pagination } from '../../../shared/ui/pagination';
import { Reveal } from '../../../shared/ui/reveal';

const PAGE_SIZE = 12;

type GymListResponse = {
  items: Array<{
    id: string;
    slug: string;
    name: string;
    district: string | null;
    city: string;
    isFeatured: boolean;
    amenities: string[];
    media: { url: string }[];
    plans: { priceAmd: number }[];
  }>;
  total: number;
  page: number;
  pageSize: number;
};

function parsePage(value: string | null): number {
  const parsed = Number(value ?? '1');
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function GymsPageContent() {
  const t = useTranslations('gyms');
  const tCommon = useTranslations('common');
  const tDistricts = useTranslations('districts');
  const tAmenities = useTranslations('amenities');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const districtParam = searchParams.get('district') ?? '';
  const amenityParam = searchParams.get('amenity') ?? '';
  const district = (YEREVAN_DISTRICTS as readonly string[]).includes(districtParam)
    ? districtParam
    : '';
  const amenity = (AMENITIES as readonly string[]).includes(amenityParam)
    ? amenityParam
    : '';
  const page = parsePage(searchParams.get('page'));

  const updateFilters = useCallback(
    (patch: { district?: string; amenity?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextDistrict =
        patch.district !== undefined ? patch.district : district;
      const nextAmenity = patch.amenity !== undefined ? patch.amenity : amenity;
      const nextPage = patch.page !== undefined ? patch.page : page;

      if (nextDistrict) params.set('district', nextDistrict);
      else params.delete('district');

      if (nextAmenity) params.set('amenity', nextAmenity);
      else params.delete('amenity');

      if (nextPage > 1) params.set('page', String(nextPage));
      else params.delete('page');

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [amenity, district, page, pathname, router, searchParams],
  );

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('city', 'Yerevan');
    if (district) params.set('district', district);
    if (amenity) params.set('amenity', amenity);
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    return params.toString();
  }, [district, amenity, page]);

  const gyms = useQuery({
    queryKey: ['gyms', query],
    queryFn: () => apiFetch<GymListResponse>(`/gyms?${query}`),
  });

  const districtOptions = useMemo(
    () => [
      { value: '', label: t('allDistricts') },
      ...YEREVAN_DISTRICTS.map((item) => ({
        value: item,
        label: tDistricts(item),
      })),
    ],
    [t, tDistricts],
  );

  const amenityOptions = useMemo(
    () => [
      { value: '', label: t('allAmenities') },
      ...AMENITIES.map((item) => ({
        value: item,
        label: tAmenities(item),
      })),
    ],
    [t, tAmenities],
  );

  const total = gyms.data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="container-shell py-12">
      <Reveal>
        <p className="eyebrow">{tCommon('yerevan')}</p>
        <h1 className="display mt-3 text-4xl font-bold sm:text-6xl">{t('title')}</h1>
        <p className="mt-3 text-[var(--muted)]">
          {gyms.data?.total ?? '…'} {t('subtitle')}
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <DarkSelect
          name="district"
          aria-label={t('allDistricts')}
          value={district}
          onChange={(value) => updateFilters({ district: value, page: 1 })}
          options={districtOptions}
        />
        <DarkSelect
          name="amenity"
          aria-label={t('allAmenities')}
          value={amenity}
          onChange={(value) => updateFilters({ amenity: value, page: 1 })}
          options={amenityOptions}
        />
      </Reveal>

      {gyms.isLoading ? (
        <p className="mt-10 text-[var(--muted)]">{t('loading')}</p>
      ) : null}

      {!gyms.isLoading && !(gyms.data?.items.length ?? 0) ? (
        <p className="mt-10 text-[var(--muted)]">{t('empty')}</p>
      ) : null}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(gyms.data?.items ?? []).map((gym, index) => (
          <GymCard
            key={gym.id}
            gym={gym}
            index={index}
            fromLabel={t('from')}
            verifiedLabel={t('verified')}
          />
        ))}
      </div>

      {!gyms.isLoading && total > 0 ? (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(nextPage) => {
            updateFilters({ page: nextPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          previousLabel={t('prev')}
          nextLabel={t('next')}
          pageLabel={t('pageInfo', { from, to, total })}
          ariaLabel={tCommon('pagination')}
        />
      ) : null}
    </div>
  );
}

export default function GymsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-shell py-12 text-[var(--muted)]">…</div>
      }
    >
      <GymsPageContent />
    </Suspense>
  );
}
