'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useTranslations } from 'next-intl';
import { AutoGrowTextarea } from './auto-grow-textarea';
import { DarkSelect } from './dark-select';
import { SPEC_KEYS, type AdminGymFormValues } from './admin-gym-form-model';

type SetValues = Dispatch<SetStateAction<AdminGymFormValues>>;

type Props = {
  values: AdminGymFormValues;
  setValues: SetValues;
};

export function AdminGymMediaPlansTrainersSection({ values, setValues }: Props) {
  const t = useTranslations('admin');
  const tSpecs = useTranslations('specializations');

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
            key={`plan-${index}`}
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
              <input
                className="field"
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

      <section className="card-glass space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display text-xl font-semibold">{t('sectionTrainers')}</h2>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() =>
              setValues((prev) => ({
                ...prev,
                trainers: [
                  ...prev.trainers,
                  {
                    name: '',
                    photoUrl: '',
                    specialization: 'strength',
                    bio: '',
                  },
                ],
              }))
            }
          >
            {t('addTrainer')}
          </button>
        </div>
        {values.trainers.map((trainer, index) => (
          <div
            key={`trainer-${index}`}
            className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 md:grid-cols-2"
          >
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('trainerName')}</span>
              <input
                className="field"
                value={trainer.name}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.trainers];
                    next[index] = { ...next[index], name: event.target.value };
                    return { ...prev, trainers: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('trainerSpec')}</span>
              <DarkSelect
                aria-label={t('trainerSpec')}
                value={trainer.specialization}
                options={SPEC_KEYS.map((key) => ({
                  value: key,
                  label: tSpecs(key),
                }))}
                onChange={(value) =>
                  setValues((prev) => {
                    const next = [...prev.trainers];
                    next[index] = { ...next[index], specialization: value };
                    return { ...prev, trainers: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-sm text-[var(--muted)]">{t('trainerPhoto')}</span>
              <input
                className="field"
                placeholder="https://..."
                value={trainer.photoUrl}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.trainers];
                    next[index] = {
                      ...next[index],
                      photoUrl: event.target.value,
                    };
                    return { ...prev, trainers: next };
                  })
                }
              />
            </label>
            <label className="block space-y-1.5 md:col-span-2">
              <span className="text-sm text-[var(--muted)]">{t('trainerBio')}</span>
              <AutoGrowTextarea
                minRows={2}
                className="w-full"
                value={trainer.bio}
                onChange={(event) =>
                  setValues((prev) => {
                    const next = [...prev.trainers];
                    next[index] = { ...next[index], bio: event.target.value };
                    return { ...prev, trainers: next };
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
                  trainers: prev.trainers.filter((_, i) => i !== index),
                }))
              }
            >
              {t('removeTrainer')}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
