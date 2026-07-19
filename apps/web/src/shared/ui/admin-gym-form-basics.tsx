'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useTranslations } from 'next-intl';
import { AutoGrowTextarea } from './auto-grow-textarea';
import { DarkSelect } from './dark-select';
import {
  AMENITY_KEYS,
  DAY_KEYS,
  DISTRICT_KEYS,
  type AdminGymFormValues,
  type OwnerOption,
} from './admin-gym-form-model';

type SetValues = Dispatch<SetStateAction<AdminGymFormValues>>;

type BasicsProps = {
  mode: 'create' | 'edit';
  values: AdminGymFormValues;
  setValues: SetValues;
  owners: OwnerOption[];
};

export function AdminGymBasicsSection({
  mode,
  values,
  setValues,
  owners,
}: BasicsProps) {
  const t = useTranslations('admin');
  const tDistricts = useTranslations('districts');

  const ownerOptions = [
    { value: '', label: t('ownerEmailManual') },
    ...owners.map((owner) => ({
      value: owner.email,
      label: `${owner.fullName ?? '—'} · ${owner.email}`,
    })),
  ];

  const statusOptions = [
    { value: 'APPROVED', label: t('statusApproved') },
    { value: 'PENDING', label: t('statusPending') },
    { value: 'DRAFT', label: t('statusDraft') },
    { value: 'REJECTED', label: t('statusRejected') },
  ];

  return (
    <section className="card-glass space-y-4 p-5">
      <h2 className="display text-xl font-semibold">{t('sectionBasics')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm text-[var(--muted)]">{t('ownerSelect')}</span>
          <DarkSelect
            aria-label={t('ownerSelect')}
            value={
              owners.some((owner) => owner.email === values.ownerEmail)
                ? values.ownerEmail
                : ''
            }
            options={ownerOptions}
            onChange={(value) => {
              if (!value) return;
              setValues((prev) => ({ ...prev, ownerEmail: value }));
            }}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('ownerEmail')}</span>
          <input
            required
            type="email"
            className="field"
            value={values.ownerEmail}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                ownerEmail: event.target.value,
              }))
            }
          />
        </label>
        {mode === 'create' ? (
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">{t('ownerFullName')}</span>
            <input
              className="field"
              value={values.ownerFullName}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  ownerFullName: event.target.value,
                }))
              }
            />
          </label>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('gymName')}</span>
          <input
            required
            className="field"
            value={values.name}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('city')}</span>
          <input
            required
            className="field"
            value={values.city}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, city: event.target.value }))
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('district')}</span>
          <DarkSelect
            aria-label={t('district')}
            value={values.district}
            options={DISTRICT_KEYS.map((key) => ({
              value: key,
              label: tDistricts(key),
            }))}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, district: value }))
            }
          />
        </label>
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm text-[var(--muted)]">{t('address')}</span>
          <input
            required
            className="field"
            value={values.address}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, address: event.target.value }))
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('phone')}</span>
          <input
            className="field"
            value={values.phone}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('moderationStatus')}</span>
          <DarkSelect
            aria-label={t('moderationStatus')}
            value={values.moderationStatus}
            options={statusOptions}
            onChange={(value) =>
              setValues((prev) => ({
                ...prev,
                moderationStatus:
                  value as AdminGymFormValues['moderationStatus'],
              }))
            }
          />
        </label>
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm text-[var(--muted)]">{t('description')}</span>
          <AutoGrowTextarea
            minRows={4}
            className="w-full"
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isFeatured}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              isFeatured: event.target.checked,
            }))
          }
        />
        {t('featuredFlag')}
      </label>
      {mode === 'create' ? (
        <label className="block max-w-xs space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('activateMonths')}</span>
          <input
            type="number"
            min={0}
            className="field"
            value={values.activateMonths}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                activateMonths: Number(event.target.value) || 0,
              }))
            }
          />
        </label>
      ) : null}
      <p className="text-xs text-[var(--muted)]">{t('ownerCreateHint')}</p>
    </section>
  );
}

type AmenitiesHoursProps = {
  values: AdminGymFormValues;
  setValues: SetValues;
};

export function AdminGymAmenitiesHoursSection({
  values,
  setValues,
}: AmenitiesHoursProps) {
  const t = useTranslations('admin');
  const tAmenities = useTranslations('amenities');

  function toggleAmenity(key: string) {
    setValues((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((item) => item !== key)
        : [...prev.amenities, key],
    }));
  }

  return (
    <>
      <section className="card-glass space-y-4 p-5">
        <h2 className="display text-xl font-semibold">{t('sectionAmenities')}</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_KEYS.map((key) => {
            const active = values.amenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className={
                  active
                    ? 'rounded-full border border-[rgba(214,255,62,0.45)] bg-[rgba(214,255,62,0.12)] px-3 py-1.5 text-xs text-[var(--accent)]'
                    : 'rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)]'
                }
              >
                {tAmenities(key)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-glass space-y-4 p-5">
        <h2 className="display text-xl font-semibold">{t('sectionHours')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAY_KEYS.map((day) => (
            <label key={day} className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t(`day_${day}`)}</span>
              <input
                className="field"
                value={values.workingHours[day]}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    workingHours: {
                      ...prev.workingHours,
                      [day]: event.target.value,
                    },
                  }))
                }
              />
            </label>
          ))}
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">{t('hoursNote')}</span>
          <input
            className="field"
            value={values.workingHours.note}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                workingHours: {
                  ...prev.workingHours,
                  note: event.target.value,
                },
              }))
            }
          />
        </label>
      </section>
    </>
  );
}
