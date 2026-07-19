'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '../api/client';
import { Link } from '../../i18n/navigation';
import { AdminGymBoardCard } from './admin-gym-board-card';
import { Reveal } from './reveal';

export type AdminGymRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string | null;
  moderationStatus: string;
  isFeatured: boolean;
  owner: { email: string; fullName?: string | null };
  media?: { url: string }[];
  plans?: { priceAmd: number }[];
  subscriptions?: Array<{ status: string; endsAt: string }>;
};

type AdminViewMode = 'list' | 'board';

const VIEW_STORAGE_KEY = 'gymhub-admin-gyms-view';

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

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="3.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="13.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

type AdminGymListProps = {
  status?: string;
  title: string;
  emptyLabel: string;
};

export function AdminGymList({ status, title, emptyLabel }: AdminGymListProps) {
  const t = useTranslations('admin');
  const qc = useQueryClient();
  const [view, setView] = useState<AdminViewMode>('list');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === 'list' || stored === 'board') setView(stored);
    } catch {
      // ignore
    }
  }, []);

  function changeView(next: AdminViewMode) {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

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
            {gyms.isLoading
              ? t('loading')
              : t('gymCount', { count: items.length })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={t('viewMode')}
            className="inline-flex rounded-full border border-[rgba(244,241,236,0.12)] bg-[rgba(255,255,255,0.03)] p-1"
          >
            <button
              type="button"
              aria-pressed={view === 'list'}
              title={t('viewList')}
              onClick={() => changeView('list')}
              className={
                view === 'list'
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold !text-[#111]'
                  : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]'
              }
            >
              <ListIcon />
              <span className="hidden sm:inline">{t('viewList')}</span>
            </button>
            <button
              type="button"
              aria-pressed={view === 'board'}
              title={t('viewBoard')}
              onClick={() => changeView('board')}
              className={
                view === 'board'
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold !text-[#111]'
                  : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]'
              }
            >
              <BoardIcon />
              <span className="hidden sm:inline">{t('viewBoard')}</span>
            </button>
          </div>
          <Link
            href="/admin/gyms/new"
            className="btn btn-primary !py-2 !px-4 text-sm"
          >
            {t('addGym')}
          </Link>
        </div>
      </div>

      {!gyms.isLoading && items.length === 0 ? (
        <p className="text-[var(--muted)]">{emptyLabel}</p>
      ) : null}

      {view === 'board' ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((gym, i) => (
            <AdminGymBoardCard
              key={gym.id}
              gym={gym}
              index={i}
              onApprove={() =>
                moderate.mutate({ id: gym.id, nextStatus: 'APPROVED' })
              }
              onReject={() =>
                moderate.mutate({ id: gym.id, nextStatus: 'REJECTED' })
              }
              onToggleFeatured={() =>
                featured.mutate({
                  id: gym.id,
                  isFeatured: !gym.isFeatured,
                })
              }
              onActivate={() => activate.mutate(gym.id)}
            />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
