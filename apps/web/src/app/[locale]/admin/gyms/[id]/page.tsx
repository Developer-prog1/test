'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../../../../shared/api/client';
import { Link } from '../../../../../i18n/navigation';
import {
  AdminGymForm,
  emptyAdminGymForm,
  type AdminGymFormValues,
  type AdminGymPayload,
} from '../../../../../shared/ui/admin-gym-form';
import { parseWorkingHours } from '../../../../../shared/lib/working-hours';
import { Reveal } from '../../../../../shared/ui/reveal';

type OwnerRow = { email: string; fullName: string | null };

type GymDetail = {
  id: string;
  name: string;
  city: string;
  district: string | null;
  address: string;
  phone: string | null;
  description: string | null;
  amenities: string[];
  workingHours: unknown;
  isFeatured: boolean;
  moderationStatus: AdminGymFormValues['moderationStatus'];
  owner: { email: string; fullName: string | null };
  media: { url: string }[];
  trainers: Array<{
    name: string;
    photoUrl: string | null;
    specialization: string | null;
    bio: string | null;
  }>;
  plans: Array<{
    title: string;
    description: string | null;
    priceAmd: number;
    durationDays: number | null;
  }>;
};

function mapGymToForm(gym: GymDetail): AdminGymFormValues {
  const base = emptyAdminGymForm();
  const hours = parseWorkingHours(gym.workingHours);
  return {
    ...base,
    ownerEmail: gym.owner.email,
    ownerFullName: gym.owner.fullName ?? '',
    name: gym.name,
    city: gym.city,
    district: gym.district ?? 'Kentron',
    address: gym.address,
    phone: gym.phone ?? '',
    description: gym.description ?? '',
    amenities: gym.amenities ?? [],
    workingHours: {
      mon: hours?.mon ?? base.workingHours.mon,
      tue: hours?.tue ?? base.workingHours.tue,
      wed: hours?.wed ?? base.workingHours.wed,
      thu: hours?.thu ?? base.workingHours.thu,
      fri: hours?.fri ?? base.workingHours.fri,
      sat: hours?.sat ?? base.workingHours.sat,
      sun: hours?.sun ?? base.workingHours.sun,
      note:
        typeof hours?.note === 'string'
          ? hours.note
          : hours?.note
            ? JSON.stringify(hours.note)
            : '',
    },
    isFeatured: gym.isFeatured,
    moderationStatus: gym.moderationStatus,
    activateMonths: 0,
    mediaUrls: gym.media.length > 0 ? gym.media.map((item) => item.url) : [''],
    trainers:
      gym.trainers.length > 0
        ? gym.trainers.map((item) => ({
            name: item.name,
            photoUrl: item.photoUrl ?? '',
            specialization: item.specialization ?? 'strength',
            bio: item.bio ?? '',
          }))
        : base.trainers,
    plans:
      gym.plans.length > 0
        ? gym.plans.map((item) => ({
            title: item.title,
            description: item.description ?? '',
            priceAmd: String(item.priceAmd),
            durationDays: String(item.durationDays ?? 30),
          }))
        : base.plans,
  };
}

export default function AdminEditGymPage() {
  const t = useTranslations('admin');
  const params = useParams<{ id: string }>();
  const gymId = params.id;
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const owners = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => apiFetch<OwnerRow[]>('/admin/owners'),
  });

  const gym = useQuery({
    queryKey: ['admin-gym', gymId],
    queryFn: () => apiFetch<GymDetail>(`/admin/gyms/${gymId}`),
    enabled: Boolean(gymId),
  });

  const initial = useMemo(
    () => (gym.data ? mapGymToForm(gym.data) : emptyAdminGymForm()),
    [gym.data],
  );

  const update = useMutation({
    mutationFn: (payload: AdminGymPayload) =>
      apiFetch(`/admin/gyms/${gymId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setSaved(true);
      await qc.invalidateQueries({ queryKey: ['admin-gym', gymId] });
      await qc.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
    onError: (err: unknown) => {
      setError(
        err instanceof ApiError ? err.message : t('saveFailed'),
      );
    },
  });

  if (owners.isError || gym.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  if (gym.isLoading || !gym.data) {
    return <p className="text-[var(--muted)]">{t('loading')}</p>;
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">{t('title')}</p>
            <h1 className="display text-3xl font-bold sm:text-4xl">
              {t('editTitle')}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{gym.data.name}</p>
          </div>
          <Link href="/admin/gyms" className="btn btn-ghost !py-2 !px-4 text-sm">
            {t('backToList')}
          </Link>
        </div>
      </Reveal>

      {saved ? (
        <p className="text-sm text-[var(--accent)]">{t('saved')}</p>
      ) : null}

      <AdminGymForm
        key={gym.data.id}
        mode="edit"
        initial={initial}
        owners={owners.data ?? []}
        submitting={update.isPending}
        error={error}
        onSubmit={(payload) => {
          setError(null);
          setSaved(false);
          update.mutate(payload);
        }}
      />
    </div>
  );
}
