'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '../api/client';
import { Link } from '../../i18n/navigation';
import { Reveal } from './reveal';

export type AdminGymRow = {
  id: string;
  slug: string;
  name: string;
  moderationStatus: string;
  isFeatured: boolean;
  owner: { email: string; fullName?: string | null };
  subscriptions?: Array<{ status: string; endsAt: string }>;
};

function moderationLabel(
  status: string,
  t: ReturnType<typeof useTranslations<'admin'>>,
): string {
  switch (status) {
    case 'APPROVED':
      return t('statusApproved');
    case 'PENDING':
      return t('statusPending');
    case 'REJECTED':
      return t('statusRejected');
    case 'DRAFT':
      return t('statusDraft');
    default:
      return status;
  }
}

type AdminGymListProps = {
  status?: string;
  title: string;
  emptyLabel: string;
};

export function AdminGymList({ status, title, emptyLabel }: AdminGymListProps) {
  const t = useTranslations('admin');
  const qc = useQueryClient();
  const query = status
    ? `/admin/gyms?limit=100&status=${encodeURIComponent(status)}`
    : '/admin/gyms?limit=100';

  const gyms = useQuery({
    queryKey: ['admin-gyms', status ?? 'all'],
    queryFn: () => apiFetch<{ items: AdminGymRow[] }>(query),
  });

  const moderate = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: string;
      nextStatus: 'APPROVED' | 'REJECTED';
    }) =>
      apiFetch(`/admin/gyms/${id}/moderation`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
  });

  const featured = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      apiFetch(`/admin/gyms/${id}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
  });

  const activate = useMutation({
    mutationFn: (gymId: string) =>
      apiFetch('/admin/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({ gymId, months: 1 }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-gyms'] });
      void qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
  });

  if (gyms.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  const items = gyms.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {gyms.isLoading ? t('loading') : t('gymCount', { count: items.length })}
          </p>
        </div>
        <Link href="/admin/gyms/new" className="btn btn-primary !py-2 !px-4 text-sm">
          {t('addGym')}
        </Link>
      </div>

      {!gyms.isLoading && items.length === 0 ? (
        <p className="text-[var(--muted)]">{emptyLabel}</p>
      ) : null}

      <div className="space-y-3">
        {items.map((gym, i) => (
          <Reveal key={gym.id} delay={Math.min(i * 0.03, 0.25)}>
            <div className="card-glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {gym.name}{' '}
                  <span className="text-sm text-[var(--muted)]">
                    ({moderationLabel(gym.moderationStatus, t)})
                  </span>
                </p>
                <p className="text-sm text-[var(--muted)]">{gym.owner.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/gyms/${gym.id}`}
                  className="btn btn-ghost !py-1.5 !px-3 text-xs"
                >
                  {t('edit')}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost !py-1.5 !px-3 text-xs"
                  onClick={() =>
                    moderate.mutate({ id: gym.id, nextStatus: 'APPROVED' })
                  }
                >
                  {t('approve')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost !py-1.5 !px-3 text-xs"
                  onClick={() =>
                    moderate.mutate({ id: gym.id, nextStatus: 'REJECTED' })
                  }
                >
                  {t('reject')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost !py-1.5 !px-3 text-xs"
                  onClick={() =>
                    featured.mutate({
                      id: gym.id,
                      isFeatured: !gym.isFeatured,
                    })
                  }
                >
                  {gym.isFeatured ? t('unfeature') : t('feature')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary !py-1.5 !px-3 text-xs"
                  onClick={() => activate.mutate(gym.id)}
                >
                  {t('plusMonth')}
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
