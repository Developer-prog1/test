'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DarkSelect } from './dark-select';
import { LocalizedFields } from './localized-fields';
import { AdminGymAmenitiesHoursSection } from './admin-gym-form-basics';
import {
  DISTRICT_KEYS,
  emptyAdminGymForm,
  toAdminGymPayload,
  type AdminGymFormValues,
} from './admin-gym-form-model';
import { AdminGymMediaPlansTrainersSection } from './admin-gym-form-nested';

export type OwnerGymFormValues = Pick<
  AdminGymFormValues,
  | 'name'
  | 'city'
  | 'district'
  | 'address'
  | 'phone'
  | 'description'
  | 'amenities'
  | 'workingHours'
  | 'mediaUrls'
  | 'trainers'
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
  workingHours: Record<string, unknown>;
  mediaUrls: string[];
  trainers: Array<{
    id?: string;
    name: string;
    photoUrl?: string;
    specialization?: string;
    bio?: string;
  }>;
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
    workingHours: base.workingHours,
    mediaUrls: base.mediaUrls,
    trainers: base.trainers,
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
  const namedTrainers = values.trainers.filter((item) => item.name.trim());
  const titledPlans = values.plans.filter((item) => item.title.trim());

  return {
    name: full.name,
    city: full.city,
    district: full.district,
    address: full.address,
    phone: full.phone,
    description: full.description,
    amenities: full.amenities,
    workingHours: full.workingHours,
    mediaUrls: full.mediaUrls,
    trainers: full.trainers.map((trainer, index) => ({
      ...trainer,
      id: namedTrainers[index]?.id,
    })),
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
      <AdminGymAmenitiesHoursSection
        values={values as AdminGymFormValues}
        setValues={setValues as Dispatch<SetStateAction<AdminGymFormValues>>}
      />
      <AdminGymMediaPlansTrainersSection
        values={values as AdminGymFormValues}
        setValues={setValues as Dispatch<SetStateAction<AdminGymFormValues>>}
      />

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
