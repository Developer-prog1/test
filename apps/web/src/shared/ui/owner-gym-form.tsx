'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DarkSelect } from './dark-select';
import { LocalizedFields } from './localized-fields';
import {
  AMENITY_KEYS,
  DISTRICT_KEYS,
  emptyAdminGymForm,
  toAdminGymPayload,
  type AdminGymFormValues,
} from './admin-gym-form-model';
import { AutoGrowTextarea } from './auto-grow-textarea';

export type OwnerGymFormValues = Pick<
  AdminGymFormValues,
  | 'name'
  | 'city'
  | 'district'
  | 'address'
  | 'phone'
  | 'description'
  | 'amenities'
  | 'mediaUrls'
  | 'plans'
>;

export type OwnerGymProfilePayload = {
  name: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  description?: string;
  amenities: string[];
  mediaUrls: string[];
  plans: Array<{
    id?: string;
    title: string;
    description?: string;
    priceAmd: number;
    durationDays: number;
    isActive: boolean;
  }>;
};

type SetValues = Dispatch<SetStateAction<OwnerGymFormValues>>;

type OwnerGymFormProps = {
  initial: OwnerGymFormValues;
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: OwnerGymProfilePayload) => void;
};

export function emptyOwnerGymForm(): OwnerGymFormValues {
  const base = emptyAdminGymForm();
  return {
    name: base.name,
    city: base.city,
    district: base.district,
    address: base.address,
    phone: base.phone,
    description: base.description,
    amenities: base.amenities,
    mediaUrls: base.mediaUrls,
    plans: base.plans,
  };
}

export function toOwnerGymPayload(
  values: OwnerGymFormValues,
): OwnerGymProfilePayload {
  const full = toAdminGymPayload(
    {
      ...emptyAdminGymForm(),
      ...values,
    },
    'edit',
  );
  const titledPlans = values.plans.filter((item) => item.title.trim());

  return {
    name: full.name,
    city: full.city,
    district: full.district,
    address: full.address,
    phone: full.phone,
    description: full.description,
    amenities: full.amenities,
    mediaUrls: full.mediaUrls,
    plans: full.plans.map((plan, index) => ({
      ...plan,
      id: titledPlans[index]?.id,
    })),
  };
}

function OwnerGymBasicsSection({
  values,
  setValues,
}: {
  values: OwnerGymFormValues;
  setValues: SetValues;
}) {
  const t = useTranslations('admin');
  const tDistricts = useTranslations('districts');

  return (
    <section className="card-glass space-y-4 p-5">
      <h2 className="display text-xl font-semibold">{t('sectionBasics')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
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
        <LocalizedFields
          label={t('address')}
          hint={t('localizedFieldsHint')}
          value={values.address}
          required
          inputName="address"
          onChange={(address) => setValues((prev) => ({ ...prev, address }))}
        />
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
        <LocalizedFields
          label={t('description')}
          hint={t('localizedFieldsHint')}
          value={values.description}
          multiline
          minRows={4}
          inputName="description"
          onChange={(description) =>
            setValues((prev) => ({ ...prev, description }))
          }
        />
      </div>
    </section>
  );
}

function OwnerGymAmenitiesSection({
  values,
  setValues,
}: {
  values: OwnerGymFormValues;
  setValues: SetValues;
}) {
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
  );
}

function OwnerGymMediaPlansSection({
  values,
  setValues,
}: {
  values: OwnerGymFormValues;
  setValues: SetValues;
}) {
  const t = useTranslations('admin');

  return (
    <>
      <section className="card-glass space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display text-xl font-semibold">{t('sectionMedia')}</h2>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() =>
              setValues((prev) => ({
                ...prev,
                mediaUrls: [...prev.mediaUrls, ''],
              }))
            }
          >
            {t('addMedia')}
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">{t('mediaHint')}</p>
        <div className="space-y-3">
          {values.mediaUrls.map((url, index) => (
            <div key={`media-${index}`} className="flex gap-2">
              <input
                className="field flex-1"
                placeholder="https://..."
                value={url}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.mediaUrls];
                    next[index] = event.target.value;
                    return { ...prev, mediaUrls: next };
                  })
                }
              />
              <button
                type="button"
                className="btn btn-ghost !px-3"
                onClick={() =>
                  setValues((prev) => ({
                    ...prev,
                    mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
                  }))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card-glass space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display text-xl font-semibold">{t('sectionPlans')}</h2>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() =>
              setValues((prev) => ({
                ...prev,
                plans: [
                  ...prev.plans,
                  {
                    title: '',
                    description: '',
                    priceAmd: '15000',
                    durationDays: '30',
                  },
                ],
              }))
            }
          >
            {t('addPlan')}
          </button>
        </div>
        {values.plans.map((plan, index) => (
          <div
            key={plan.id ?? `plan-${index}`}
            className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 md:grid-cols-2"
          >
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('planTitle')}</span>
              <input
                className="field"
                value={plan.title}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.plans];
                    next[index] = { ...next[index], title: event.target.value };
                    return { ...prev, plans: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('planPrice')}</span>
              <input
                type="number"
                min={0}
                className="field"
                value={plan.priceAmd}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.plans];
                    next[index] = {
                      ...next[index],
                      priceAmd: event.target.value,
                    };
                    return { ...prev, plans: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('planDays')}</span>
              <input
                type="number"
                min={1}
                className="field"
                value={plan.durationDays}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.plans];
                    next[index] = {
                      ...next[index],
                      durationDays: event.target.value,
                    };
                    return { ...prev, plans: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-sm text-[var(--muted)]">
                {t('planDescription')}
              </span>
              <AutoGrowTextarea
                minRows={2}
                className="w-full"
                value={plan.description}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.plans];
                    next[index] = {
                      ...next[index],
                      description: event.target.value,
                    };
                    return { ...prev, plans: next };
                  })
                }
              />
            </label>
            <button
              type="button"
              className="btn btn-ghost !py-1.5 !px-3 text-xs md:col-span-2"
              onClick={() =>
                setValues((prev) => ({
                  ...prev,
                  plans: prev.plans.filter((_, i) => i !== index),
                }))
              }
            >
              {t('removePlan')}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}

export function OwnerGymForm({
  initial,
  submitting,
  error,
  onSubmit,
}: OwnerGymFormProps) {
  const t = useTranslations('admin');
  const tOwner = useTranslations('owner');
  const [values, setValues] = useState(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(toOwnerGymPayload(values));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <OwnerGymBasicsSection values={values} setValues={setValues} />
      <OwnerGymAmenitiesSection values={values} setValues={setValues} />
      <OwnerGymMediaPlansSection values={values} setValues={setValues} />

      {error ? (
        <p className="text-sm text-[var(--accent-hot)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary disabled:opacity-60"
      >
        {submitting ? t('saving') : tOwner('saveGym')}
      </button>
    </form>
  );
}
