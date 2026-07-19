'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { Link } from '../../../i18n/navigation';
import { Reveal } from '../../../shared/ui/reveal';

type GymRow = {
  id: string;
  moderationStatus: string;
  isFeatured: boolean;
};

type OwnerRow = { id: string };
type SubRow = { status: string };

export default function AdminOverviewPage() {
  const t = useTranslations('admin');

  const gyms = useQuery({
    queryKey: ['admin-gyms', 'all'],
    queryFn: () => apiFetch<{ items: GymRow[]; total: number }>('/admin/gyms?limit=100'),
  });
  const owners = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => apiFetch<OwnerRow[]>('/admin/owners'),
  });
  const subscriptions = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => apiFetch<SubRow[]>('/admin/subscriptions'),
  });

  const stats = useMemo(() => {
    const items = gyms.data?.items ?? [];
    return {
      totalGyms: gyms.data?.total ?? items.length,
      pending: items.filter((item) => item.moderationStatus === 'PENDING').length,
      featured: items.filter((item) => item.isFeatured).length,
      owners: owners.data?.length ?? 0,
      activeSubs:
        subscriptions.data?.filter((item) => item.status === 'ACTIVE').length ?? 0,
    };
  }, [gyms.data, owners.data, subscriptions.data]);

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

  const cards = [
    { label: t('statGyms'), value: stats.totalGyms, href: '/admin/gyms' },
    { label: t('statPending'), value: stats.pending, href: '/admin/moderation' },
    { label: t('statFeatured'), value: stats.featured, href: '/admin/gyms' },
    { label: t('statOwners'), value: stats.owners, href: '/admin/owners' },
    {
      label: t('statActiveSubs'),
      value: stats.activeSubs,
      href: '/admin/subscriptions',
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="display text-3xl font-bold sm:text-4xl">{t('overviewTitle')}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">{t('overviewSubtitle')}</p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <Reveal key={card.label} delay={Math.min(index * 0.05, 0.25)}>
            <Link
              href={card.href}
              className="card-glass block p-5 transition hover:-translate-y-0.5 hover:border-[rgba(214,255,62,0.35)]"
            >
              <p className="text-sm text-[var(--muted)]">{card.label}</p>
              <p className="display mt-3 text-4xl font-bold text-[var(--accent)]">
                {gyms.isLoading ? '…' : card.value}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="card-glass flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">{t('quickActions')}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{t('quickActionsHint')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/gyms/new" className="btn btn-primary !py-2 !px-4 text-sm">
              {t('addGym')}
            </Link>
            <Link href="/admin/moderation" className="btn btn-ghost !py-2 !px-4 text-sm">
              {t('navModeration')}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
