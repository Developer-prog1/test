'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../../../../shared/api/client';
import { Link, useRouter } from '../../../../../i18n/navigation';
import {
  AdminGymForm,
  emptyAdminGymForm,
  type AdminGymPayload,
} from '../../../../../shared/ui/admin-gym-form';
import { Reveal } from '../../../../../shared/ui/reveal';

type OwnerRow = { email: string; fullName: string | null };

export default function AdminCreateGymPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const owners = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => apiFetch<OwnerRow[]>('/admin/owners'),
  });

  const create = useMutation({
    mutationFn: (payload: AdminGymPayload) =>
      apiFetch<{ id: string }>('/admin/gyms', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (gym) => {
      router.push(`/admin/gyms/${gym.id}`);
    },
    onError: (err: unknown) => {
      setError(
        err instanceof ApiError ? err.message : t('saveFailed'),
      );
    },
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

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">{t('title')}</p>
            <h1 className="display text-3xl font-bold sm:text-4xl">
              {t('createTitle')}
            </h1>
          </div>
          <Link href="/admin/gyms" className="btn btn-ghost !py-2 !px-4 text-sm">
            {t('backToList')}
          </Link>
        </div>
      </Reveal>

      <AdminGymForm
        mode="create"
        initial={emptyAdminGymForm()}
        owners={owners.data ?? []}
        submitting={create.isPending}
        error={error}
        onSubmit={(payload) => {
          setError(null);
          create.mutate(payload);
        }}
      />
    </div>
  );
}
