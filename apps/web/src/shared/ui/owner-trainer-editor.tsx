'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../api/client';
import { SPEC_KEYS } from './admin-gym-form-model';
import { AutoGrowTextarea } from './auto-grow-textarea';
import { DarkSelect } from './dark-select';
import { SafeImage } from './safe-image';

export type OwnerTrainer = {
  id: string;
  name: string;
  photoUrl: string | null;
  specialization: string | null;
  bio: string | null;
};

export type OwnerTrainerDraft = {
  name: string;
  photoUrl: string;
  specialization: string;
  bio: string;
};

export function emptyOwnerTrainerDraft(): OwnerTrainerDraft {
  return {
    name: '',
    photoUrl: '',
    specialization: 'strength',
    bio: '',
  };
}

export function ownerTrainerToDraft(trainer: OwnerTrainer): OwnerTrainerDraft {
  return {
    name: trainer.name,
    photoUrl: trainer.photoUrl ?? '',
    specialization: trainer.specialization ?? 'strength',
    bio: trainer.bio ?? '',
  };
}

export function OwnerTrainerEditor({
  draft,
  onChange,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting,
  error,
  isNew,
}: {
  draft: OwnerTrainerDraft;
  onChange: (next: OwnerTrainerDraft) => void;
  onSave: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  saving: boolean;
  deleting?: boolean;
  error: string | null;
  isNew: boolean;
}) {
  const t = useTranslations('owner');
  const tAdmin = useTranslations('admin');
  const tSpecs = useTranslations('specializations');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 md:grid-cols-2"
    >
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">{tAdmin('trainerName')}</span>
        <input
          required
          className="field"
          value={draft.name}
          onChange={(event) =>
            onChange({ ...draft, name: event.target.value })
          }
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">{tAdmin('trainerSpec')}</span>
        <DarkSelect
          aria-label={tAdmin('trainerSpec')}
          value={draft.specialization}
          options={SPEC_KEYS.map((key) => ({
            value: key,
            label: tSpecs(key),
          }))}
          onChange={(value) => onChange({ ...draft, specialization: value })}
        />
      </label>
      <label className="block space-y-1.5 md:col-span-2">
        <span className="text-sm text-[var(--muted)]">{tAdmin('trainerPhoto')}</span>
        <input
          className="field"
          placeholder="https://..."
          value={draft.photoUrl}
          onChange={(event) =>
            onChange({ ...draft, photoUrl: event.target.value })
          }
        />
      </label>
      <label className="block space-y-1.5 md:col-span-2">
        <span className="text-sm text-[var(--muted)]">{tAdmin('trainerBio')}</span>
        <AutoGrowTextarea
          minRows={2}
          className="w-full"
          value={draft.bio}
          onChange={(event) => onChange({ ...draft, bio: event.target.value })}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--accent-hot)] md:col-span-2">{error}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <button
          type="submit"
          disabled={saving || deleting}
          className="btn btn-primary disabled:opacity-60"
        >
          {saving ? t('saving') : isNew ? t('addTrainer') : t('saveTrainer')}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={saving || deleting}
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            className="btn btn-ghost disabled:opacity-60"
            disabled={saving || deleting}
            onClick={onDelete}
          >
            {deleting ? t('saving') : t('removeTrainer')}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function OwnerTrainerCard({
  trainer,
  onChanged,
}: {
  trainer: OwnerTrainer;
  onChanged: () => void;
}) {
  const t = useTranslations('owner');
  const tSpecs = useTranslations('specializations');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => ownerTrainerToDraft(trainer));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(ownerTrainerToDraft(trainer));
    setEditing(false);
    setError(null);
  }, [trainer]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<OwnerTrainer>(`/owner/trainers/${trainer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: draft.name.trim(),
          photoUrl: draft.photoUrl.trim() || undefined,
          specialization: draft.specialization || undefined,
          bio: draft.bio.trim() || undefined,
        }),
      }),
    onSuccess: () => {
      setError(null);
      setEditing(false);
      onChanged();
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : t('trainerSaveFailed'));
    },
  });

  const remove = useMutation({
    mutationFn: () =>
      apiFetch(`/owner/trainers/${trainer.id}`, { method: 'DELETE' }),
    onSuccess: () => onChanged(),
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : t('trainerDeleteFailed'));
    },
  });

  if (editing) {
    return (
      <OwnerTrainerEditor
        draft={draft}
        onChange={setDraft}
        onSave={() => save.mutate()}
        onCancel={() => {
          setDraft(ownerTrainerToDraft(trainer));
          setEditing(false);
          setError(null);
        }}
        onDelete={() => remove.mutate()}
        saving={save.isPending}
        deleting={remove.isPending}
        error={error}
        isNew={false}
      />
    );
  }

  const specKey = trainer.specialization ?? '';
  const knownSpec = (SPEC_KEYS as readonly string[]).includes(specKey);
  const specLabel = knownSpec
    ? tSpecs(specKey as (typeof SPEC_KEYS)[number])
    : specKey;

  return (
    <div className="card-glass flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.04)]">
        {trainer.photoUrl ? (
          <SafeImage
            src={trainer.photoUrl}
            alt={trainer.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--muted)]">
            {trainer.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="display text-xl font-semibold">{trainer.name}</p>
        {specLabel ? (
          <p className="mt-1 text-sm text-[var(--accent)]">{specLabel}</p>
        ) : null}
        {trainer.bio ? (
          <p className="mt-2 text-sm text-[var(--muted)]">{trainer.bio}</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-[var(--accent-hot)]">{error}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() => setEditing(true)}
          >
            {t('editTrainer')}
          </button>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs disabled:opacity-60"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            {remove.isPending ? t('saving') : t('removeTrainer')}
          </button>
        </div>
      </div>
    </div>
  );
}
