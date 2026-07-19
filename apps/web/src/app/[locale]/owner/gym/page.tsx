'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import { parseLocalizedInput } from '../../../../shared/lib/localize';
import { parseWorkingHours } from '../../../../shared/lib/working-hours';
import { Link } from '../../../../i18n/navigation';
import {
  emptyOwnerGymForm,
  OwnerGymForm,
  type OwnerGymFormValues,
  type OwnerGymProfilePayload,
} from '../../../../shared/ui/owner-gym-form';
import { Reveal } from '../../../../shared/ui/reveal';

type OwnerGymDetail = {
  id: string;
  name: string;
  city: string;
  district: string | null;
  address: string;
  phone: string | null;
  description: string | null;
  amenities: string[];
  workingHours: unknown;
  moderationStatus: string;
  media: Array<{ id: string; url: string; sortOrder: number }>;
  trainers: Array<{
    id: string;
    name: string;
    photoUrl: string | null;
    specialization: string | null;
    bio: string | null;
  }>;
  plans: Array<{
    id: string;
    title: string;
    description: string | null;
    priceAmd: number;
    durationDays: number | null;
  }>;
};

function mapGymToForm(gym: OwnerGymDetail): OwnerGymFormValues {
  const base = emptyOwnerGymForm();
  const hours = parseWorkingHours(gym.workingHours);
  return {
    name: gym.name,
    city: gym.city,
    district: gym.district ?? 'Kentron',
    address: parseLocalizedInput(gym.address),
    phone: gym.phone ?? '',
    description: parseLocalizedInput(gym.description),
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
    mediaUrls:
      gym.media.length > 0
        ? [...gym.media]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => item.url)
        : [''],
    trainers:
      gym.trainers.length > 0
        ? gym.trainers.map((item) => ({
            id: item.id,
            name: item.name,
            photoUrl: item.photoUrl ?? '',
            specialization: item.specialization ?? 'strength',
            bio: item.bio ?? '',
          }))
        : base.trainers,
    plans:
      gym.plans.length > 0
        ? gym.plans.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description ?? '',
            priceAmd: String(item.priceAmd),
            durationDays: String(item.durationDays ?? 30),
          }))
        : base.plans,
  };
}

async function syncTrainers(
  initial: OwnerGymDetail['trainers'],
  next: OwnerGymProfilePayload['trainers'],
) {
  const keptIds = new Set(
    next.map((item) => item.id).filter((id): id is string => Boolean(id)),
  );

  for (const trainer of initial) {
    if (!keptIds.has(trainer.id)) {
      await apiFetch(`/owner/trainers/${trainer.id}`, { method: 'DELETE' });
    }
  }

  for (const trainer of next) {
    const body = {
      name: trainer.name,
      photoUrl: trainer.photoUrl,
      specialization: trainer.specialization,
      bio: trainer.bio,
    };
    if (trainer.id) {
      await apiFetch(`/owner/trainers/${trainer.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch('/owner/trainers', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
  }
}

async function syncPlans(
  initial: OwnerGymDetail['plans'],
  next: OwnerGymProfilePayload['plans'],
) {
  const keptIds = new Set(
    next.map((item) => item.id).filter((id): id is string => Boolean(id)),
  );

  for (const plan of initial) {
    if (!keptIds.has(plan.id)) {
      await apiFetch(`/owner/plans/${plan.id}`, { method: 'DELETE' });
    }
  }

  for (const plan of next) {
    const body = {
      title: plan.title,
      description: plan.description,
      priceAmd: plan.priceAmd,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
    };
    if (plan.id) {
      await apiFetch(`/owner/plans/${plan.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch('/owner/plans', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
  }
}

async function saveOwnerGym(
  gym: OwnerGymDetail,
  payload: OwnerGymProfilePayload,
) {
  await apiFetch('/owner/gym', {
    method: 'PATCH',
    body: JSON.stringify({
      name: payload.name,
      city: payload.city,
      district: payload.district,
      address: payload.address,
      phone: payload.phone,
      description: payload.description,
      amenities: payload.amenities,
      workingHours: payload.workingHours,
    }),
  });

  await apiFetch('/owner/gym/media', {
    method: 'PUT',
    body: JSON.stringify({ urls: payload.mediaUrls }),
  });

  await syncTrainers(gym.trainers, payload.trainers);
  await syncPlans(gym.plans, payload.plans);
}

export default function OwnerGymPage() {
  const t = useTranslations('owner');
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const gym = useQuery({
    queryKey: ['owner-gym'],
    queryFn: () => apiFetch<OwnerGymDetail>('/owner/gym'),
  });

  const initial = useMemo(
    () => (gym.data ? mapGymToForm(gym.data) : emptyOwnerGymForm()),
    [gym.data],
  );

  const save = useMutation({
    mutationFn: (payload: OwnerGymProfilePayload) => {
      if (!gym.data) throw new Error('Gym not loaded');
      return saveOwnerGym(gym.data, payload);
    },
    onSuccess: async () => {
      setError(null);
      setSaved(true);
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
    onError: (err: unknown) => {
      setSaved(false);
      setError(err instanceof ApiError ? err.message : t('saveFailed'));
    },
  });

  const submitReview = useMutation({
    mutationFn: () =>
      apiFetch('/owner/gym/submit', {
        method: 'POST',
      }),
    onSuccess: async () => {
      setError(null);
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : t('submitFailed'));
    },
  });

  if (gym.isError) {
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
    return <p className="text-[var(--muted)]">{t('loadingGym')}</p>;
  }

  const canSubmit =
    gym.data.moderationStatus === 'DRAFT' ||
    gym.data.moderationStatus === 'REJECTED';

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-bold">{t('gymEditTitle')}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t('gymEditSubtitle')}
            </p>
          </div>
          {canSubmit ? (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={submitReview.isPending}
              onClick={() => submitReview.mutate()}
            >
              {submitReview.isPending ? t('submitting') : t('submitForReview')}
            </button>
          ) : null}
        </div>
      </Reveal>

      {saved ? (
        <p className="text-sm text-[var(--accent)]">{t('saveSuccess')}</p>
      ) : null}

      <Reveal delay={0.05}>
        <OwnerGymForm
          key={gym.data.id + String(gym.dataUpdatedAt)}
          initial={initial}
          submitting={save.isPending}
          error={error}
          onSubmit={(payload) => {
            setSaved(false);
            save.mutate(payload);
          }}
        />
      </Reveal>
    </div>
  );
}
