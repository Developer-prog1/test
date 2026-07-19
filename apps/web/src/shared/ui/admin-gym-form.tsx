'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AdminGymAmenitiesHoursSection,
  AdminGymBasicsSection,
} from './admin-gym-form-basics';
import {
  emptyAdminGymForm,
  toAdminGymPayload,
  type AdminGymFormValues,
  type AdminGymPayload,
  type OwnerOption,
} from './admin-gym-form-model';
import { AdminGymMediaPlansTrainersSection } from './admin-gym-form-nested';

export {
  emptyAdminGymForm,
  toAdminGymPayload,
  type AdminGymFormValues,
  type AdminGymPayload,
};

type AdminGymFormProps = {
  mode: 'create' | 'edit';
  initial: AdminGymFormValues;
  owners: OwnerOption[];
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: AdminGymPayload) => void;
};

export function AdminGymForm({
  mode,
  initial,
  owners,
  submitting,
  error,
  onSubmit,
}: AdminGymFormProps) {
  const t = useTranslations('admin');
  const [values, setValues] = useState(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(toAdminGymPayload(values, mode));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AdminGymBasicsSection
        mode={mode}
        values={values}
        setValues={setValues}
        owners={owners}
      />
      <AdminGymAmenitiesHoursSection values={values} setValues={setValues} />
      <AdminGymMediaPlansTrainersSection values={values} setValues={setValues} />

      {error ? (
        <p className="text-sm text-[var(--accent-hot)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary disabled:opacity-60"
      >
        {submitting
          ? t('saving')
          : mode === 'create'
            ? t('createGym')
            : t('saveGym')}
      </button>
    </form>
  );
}
