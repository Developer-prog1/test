'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../../shared/api/client';
import { Link } from '../../../../i18n/navigation';
import { Pagination } from '../../../../shared/ui/pagination';
import { scrollPortalToTop } from '../../../../shared/ui/portal-main';
import { Reveal } from '../../../../shared/ui/reveal';

const PAGE_SIZE = 12;

type SubRow = {
  id: string;
  status: string;
  priceAmd: number;
  startsAt: string;
  endsAt: string;
  gym: { id: string; name: string; slug: string };
};

type SubListResponse = {
  items: SubRow[];
  total: number;
  page: number;
  pageSize: number;
};

function statusLabel(
  status: string,
  t: ReturnType<typeof useTranslations<'admin'>>,
): string {
  switch (status) {
    case 'ACTIVE':
      return t('subActive');
    case 'EXPIRED':
      return t('subExpired');
    case 'CANCELED':
      return t('subCanceled');
    case 'PAST_DUE':
      return t('subPastDue');
    default:
      return status;
  }
}

export default function AdminSubscriptionsPage() {
  const t = useTranslations('admin');
  const tGyms = useTranslations('gyms');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const subscriptions = useQuery({
    queryKey: ['admin-subscriptions', page, PAGE_SIZE],
    queryFn: () =>
      apiFetch<SubListResponse>(
        `/admin/subscriptions?page=${page}&limit=${PAGE_SIZE}`,
      ),
  });

  useEffect(() => {
    const total = subscriptions.data?.total;
    if (total == null) return;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [subscriptions.data?.total, page]);

  const activate = useMutation({
    mutationFn: (gymId: string) =>
      apiFetch('/admin/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({ gymId, months: 1 }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      void qc.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
  });

  if (subscriptions.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  const items = subscriptions.data?.items ?? [];
  const total = subscriptions.data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function goToPage(nextPage: number) {
    setPage(nextPage);
    scrollPortalToTop();
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="display text-3xl font-bold sm:text-4xl">
          {t('navSubscriptions')}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {subscriptions.isLoading
            ? t('loading')
            : t('subCount', { count: total })}
        </p>
      </Reveal>

      {!subscriptions.isLoading && items.length === 0 ? (
        <p className="text-[var(--muted)]">{t('emptySubs')}</p>
      ) : null}

      <div className="space-y-3">
        {items.map((sub, index) => (
          <Reveal key={sub.id} delay={Math.min(index * 0.03, 0.25)}>
            <div className="card-glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {sub.gym.name}{' '}
                  <span className="text-sm text-[var(--muted)]">
                    ({statusLabel(sub.status, t)})
                  </span>
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {new Date(sub.startsAt).toLocaleDateString(locale)} →{' '}
                  {new Date(sub.endsAt).toLocaleDateString(locale)} ·{' '}
                  {sub.priceAmd.toLocaleString()} {t('currencyAmd')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/gyms/${sub.gym.id}`}
                  className="btn btn-ghost !py-1.5 !px-3 text-xs"
                >
                  {t('edit')}
                </Link>
                <button
                  type="button"
                  className="btn btn-primary !py-1.5 !px-3 text-xs"
                  onClick={() => activate.mutate(sub.gym.id)}
                >
                  {t('plusMonth')}
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {!subscriptions.isLoading && total > 0 ? (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={goToPage}
          previousLabel={tGyms('prev')}
          nextLabel={tGyms('next')}
          pageLabel={tGyms('pageInfo', { from, to, total })}
          ariaLabel={tCommon('pagination')}
        />
      ) : null}
    </div>
  );
}
