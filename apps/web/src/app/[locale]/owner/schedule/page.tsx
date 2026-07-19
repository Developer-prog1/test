'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import {
  parseWorkingHours,
  WORKING_DAY_KEYS,
  type WorkingDayKey,
} from '../../../../shared/lib/working-hours';
import { Link } from '../../../../i18n/navigation';
import { DAY_KEYS } from '../../../../shared/ui/admin-gym-form-model';
import { Reveal } from '../../../../shared/ui/reveal';

type ScheduleValues = Record<WorkingDayKey, string> & { note: string };

const DEFAULT_HOURS: ScheduleValues = {
  mon: '07:00-22:00',
  tue: '07:00-22:00',
  wed: '07:00-22:00',
  thu: '07:00-22:00',
  fri: '07:00-22:00',
  sat: '09:00-21:00',
  sun: '10:00-18:00',
  note: '',
};

function mapHours(value: unknown): ScheduleValues {
  const hours = parseWorkingHours(value);
  return {
    mon: hours?.mon ?? DEFAULT_HOURS.mon,
    tue: hours?.tue ?? DEFAULT_HOURS.tue,
    wed: hours?.wed ?? DEFAULT_HOURS.wed,
    thu: hours?.thu ?? DEFAULT_HOURS.thu,
    fri: hours?.fri ?? DEFAULT_HOURS.fri,
    sat: hours?.sat ?? DEFAULT_HOURS.sat,
    sun: hours?.sun ?? DEFAULT_HOURS.sun,
    note:
      typeof hours?.note === 'string'
        ? hours.note
        : hours?.note
          ? JSON.stringify(hours.note)
          : '',
  };
}

export default function OwnerSchedulePage() {
  const t = useTranslations('owner');
  const tAdmin = useTranslations('admin');
  const qc = useQueryClient();
  const [values, setValues] = useState<ScheduleValues>(DEFAULT_HOURS);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const gym = useQuery({
    queryKey: ['owner-gym'],
    queryFn: () =>
      apiFetch<{ id: string; workingHours: unknown }>('/owner/gym'),
  });

  const initial = useMemo(
    () => (gym.data ? mapHours(gym.data.workingHours) : DEFAULT_HOURS),
    [gym.data],
  );

  useEffect(() => {
    setValues(initial);
    setSaved(false);
    setError(null);
  }, [initial]);

  const save = useMutation({
    mutationFn: () => {
      const workingHours: Record<string, unknown> = {
        ...WORKING_DAY_KEYS.reduce(
          (acc, day) => {
            acc[day] = values[day].trim() || 'closed';
            return acc;
          },
          {} as Record<string, string>,
        ),
      };
      if (values.note.trim()) {
        workingHours.note = values.note.trim();
      }
      return apiFetch('/owner/gym', {
        method: 'PATCH',
        body: JSON.stringify({ workingHours }),
      });
    },
    onSuccess: async () => {
      setError(null);
      setSaved(true);
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
    onError: (err: unknown) => {
      setSaved(false);
      setError(err instanceof ApiError ? err.message : t('scheduleSaveFailed'));
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setError(null);
    save.mutate();
  }

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
    return <p className="text-[var(--muted)]">{t('loadingSchedule')}</p>;
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="display text-4xl font-bold">{t('scheduleTitle')}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t('scheduleSubtitle')}
        </p>
      </Reveal>

      {saved ? (
        <p className="text-sm text-[var(--accent)]">{t('scheduleSaved')}</p>
      ) : null}

      <Reveal delay={0.05}>
        <form onSubmit={onSubmit} className="card-glass space-y-5 p-5 sm:p-6">
          <h2 className="display text-xl font-semibold">
            {tAdmin('sectionHours')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DAY_KEYS.map((day) => (
              <label key={day} className="block space-y-1.5">
                <span className="text-sm text-[var(--muted)]">
                  {tAdmin(`day_${day}`)}
                </span>
                <input
                  className="field"
                  value={values[day]}
                  placeholder="07:00-22:00"
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [day]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">
              {tAdmin('hoursNote')}
            </span>
            <input
              className="field"
              value={values.note}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, note: event.target.value }))
              }
            />
          </label>
          <p className="text-xs text-[var(--muted)]">{t('scheduleHint')}</p>
          {error ? (
            <p className="text-sm text-[var(--accent-hot)]">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={save.isPending}
            className="btn btn-primary disabled:opacity-60"
          >
            {save.isPending ? t('saving') : t('saveSchedule')}
          </button>
        </form>
      </Reveal>
    </div>
  );
}
