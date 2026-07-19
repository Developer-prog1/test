'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '../api/client';
import { Link } from '../../i18n/navigation';
import { AdminGymBoardCard } from './admin-gym-board-card';
import { AdminGymListRow } from './admin-gym-list-row';
import {
  AdminGymViewToggle,
  type AdminViewMode,
} from './admin-gym-view-toggle';
import { Pagination } from './pagination';

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

type AdminGymListResponse = {
  items: AdminGymRow[];
  total: number;
  page: number;
  pageSize: number;
};

const VIEW_STORAGE_KEY = 'gymhub-admin-gyms-view';
const PAGE_SIZE = 12;

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
  const tGyms = useTranslations('gyms');
  const tCommon = useTranslations('common');
  const qc = useQueryClient();
  const [view, setView] = useState<AdminViewMode>('list');
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === 'list' || stored === 'board') setView(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [status]);

  function changeView(next: AdminViewMode) {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const gyms = useQuery({
    queryKey: ['admin-gyms', status ?? 'all', page, PAGE_SIZE],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status) params.set('status', status);
      return apiFetch<AdminGymListResponse>(`/admin/gyms?${params}`);
    },
  });

  useEffect(() => {
    const total = gyms.data?.total;
    if (total == null) return;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [gyms.data?.total, page]);

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
  const total = gyms.data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {gyms.isLoading
              ? t('loading')
              : t('gymCount', { count: total })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminGymViewToggle
            view={view}
            onChange={changeView}
            ariaLabel={t('viewMode')}
            listLabel={t('viewList')}
            boardLabel={t('viewBoard')}
          />
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
            <AdminGymListRow
              key={gym.id}
              gym={gym}
              index={i}
              statusLabel={moderationLabel(gym.moderationStatus, t)}
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
      )}

      {!gyms.isLoading && total > 0 ? (
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
