'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../../shared/api/client';
import { Link } from '../../../../i18n/navigation';
import { Reveal } from '../../../../shared/ui/reveal';

type OwnerRow = {
  id: string;
  email: string;
  fullName: string | null;
};

export default function AdminOwnersPage() {
  const t = useTranslations('admin');
  const owners = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => apiFetch<OwnerRow[]>('/admin/owners'),
  });

  if (owners.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  const items = owners.data ?? [];

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="display text-3xl font-bold sm:text-4xl">{t('navOwners')}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {owners.isLoading
            ? t('loading')
            : t('ownerCount', { count: items.length })}
        </p>
      </Reveal>

      {!owners.isLoading && items.length === 0 ? (
        <p className="text-[var(--muted)]">{t('emptyOwners')}</p>
      ) : null}

      <div className="space-y-3">
        {items.map((owner, index) => (
          <Reveal key={owner.id} delay={Math.min(index * 0.03, 0.25)}>
            <div className="card-glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {owner.fullName?.trim() || t('unnamedOwner')}
                </p>
                <p className="text-sm text-[var(--muted)]">{owner.email}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
