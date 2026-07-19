'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../api/client';
import { localizeText } from '../lib/localize';
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
  isActive?: boolean;
};

function isTrainerActive(trainer: Pick<OwnerTrainer, 'isActive'>): boolean {
  return trainer.isActive !== false;
}

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

function useSpecLabel(specialization: string | null | undefined): string {
  const tSpecs = useTranslations('specializations');
  const tCommon = useTranslations('common');
  const key = specialization ?? '';
  if ((SPEC_KEYS as readonly string[]).includes(key)) {
    return tSpecs(key as (typeof SPEC_KEYS)[number]);
  }
  return key || tCommon('coach');
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

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.1 4.9a2.1 2.1 0 0 1 3 3L8.2 16.8 4 18l1.2-4.2L14.1 4.9Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m12.8 6.2 5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.2 4.8h5.6l.6 1.7H19.5v1.6H4.5V6.5h4.1L9.2 4.8Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 8.8h9.6l-.7 10.2a1.8 1.8 0 0 1-1.8 1.7H9.7a1.8 1.8 0 0 1-1.8-1.7L7.2 8.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 11.4v6M13.8 11.4v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActivateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m8.8 12.2 2.2 2.2 4.4-4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeactivateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 15 15 9M9 9l6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OwnerTrainerGridCard({
  trainer,
  onOpen,
  onEdit,
  onDelete,
  onToggleActive,
  deleting = false,
  toggling = false,
}: {
  trainer: OwnerTrainer;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  deleting?: boolean;
  toggling?: boolean;
}) {
  const t = useTranslations('owner');
  const locale = useLocale();
  const specLabel = useSpecLabel(trainer.specialization);
  const inactive = !isTrainerActive(trainer);

  return (
    <article
      className={
        inactive
          ? 'card-glass group relative w-full overflow-hidden opacity-70 transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)] hover:opacity-100'
          : 'card-glass group relative w-full overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]'
      }
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={trainer.name}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          <SafeImage
            src={trainer.photoUrl}
            alt={trainer.name}
            fill
            className={
              inactive
                ? 'object-cover object-[center_18%] grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0'
                : 'object-cover object-[center_18%] transition duration-700 group-hover:scale-105'
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute left-3 top-3">
            <span
              className={
                isTrainerActive(trainer)
                  ? 'rounded-full border border-[rgba(214,255,62,0.35)] bg-[rgba(12,14,18,0.7)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] backdrop-blur-sm'
                  : 'rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(12,14,18,0.7)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] backdrop-blur-sm'
              }
            >
              {isTrainerActive(trainer)
                ? t('trainerActive')
                : t('trainerInactive')}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4 sm:p-5">
            <p className="eyebrow !normal-case !tracking-[0.08em]">{specLabel}</p>
            <h2 className="display text-xl font-bold sm:text-2xl">
              {trainer.name}
            </h2>
            {trainer.bio ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-[rgba(244,241,236,0.78)]">
                {localizeText(trainer.bio, locale)}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-3 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(12,14,18,0.72)] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <button
            type="button"
            disabled={toggling}
            onClick={onToggleActive}
            className={
              isTrainerActive(trainer)
                ? 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(255,180,80,0.14)] text-[#ffb45c] transition hover:bg-[rgba(255,180,80,0.24)] disabled:opacity-50'
                : 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(214,255,62,0.14)] text-[var(--accent)] transition hover:bg-[rgba(214,255,62,0.24)] disabled:opacity-50'
            }
            aria-label={
              isTrainerActive(trainer)
                ? t('deactivateTrainer')
                : t('activateTrainer')
            }
            title={
              isTrainerActive(trainer)
                ? t('deactivateTrainer')
                : t('activateTrainer')
            }
          >
            {isTrainerActive(trainer) ? <DeactivateIcon /> : <ActivateIcon />}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(214,255,62,0.14)] text-[var(--accent)] transition hover:bg-[rgba(214,255,62,0.24)] hover:shadow-[0_0_16px_rgba(214,255,62,0.28)]"
            aria-label={t('editTrainer')}
            title={t('editTrainer')}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(255,92,92,0.12)] text-[#ff8d8d] transition hover:bg-[rgba(255,92,92,0.22)] hover:shadow-[0_0_16px_rgba(255,92,92,0.25)] disabled:opacity-50"
            aria-label={t('removeTrainer')}
            title={t('removeTrainer')}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export function OwnerTrainerPreviewModal({
  trainer,
  open,
  onClose,
  onChanged,
  startInEdit = false,
  onEditChange,
}: {
  trainer: OwnerTrainer | null;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  startInEdit?: boolean;
  onEditChange?: (editing: boolean) => void;
}) {
  const t = useTranslations('owner');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [draft, setDraft] = useState(emptyOwnerTrainerDraft);
  const [error, setError] = useState<string | null>(null);
  const specLabel = useSpecLabel(trainer?.specialization);

  useEffect(() => {
    if (!trainer) return;
    setDraft(ownerTrainerToDraft(trainer));
    setMode(startInEdit ? 'edit' : 'preview');
    setError(null);
  }, [trainer, startInEdit]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const save = useMutation({
    mutationFn: () => {
      if (!trainer) throw new Error('No trainer');
      return apiFetch<OwnerTrainer>(`/owner/trainers/${trainer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: draft.name.trim(),
          photoUrl: draft.photoUrl.trim() || undefined,
          specialization: draft.specialization || undefined,
          bio: draft.bio.trim() || undefined,
        }),
      });
    },
    onSuccess: () => {
      setError(null);
      setMode('preview');
      onEditChange?.(false);
      onChanged();
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : t('trainerSaveFailed'));
    },
  });

  const remove = useMutation({
    mutationFn: () => {
      if (!trainer) throw new Error('No trainer');
      return apiFetch(`/owner/trainers/${trainer.id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      onChanged();
      onClose();
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : t('trainerDeleteFailed'));
    },
  });

  const toggleActive = useMutation({
    mutationFn: () => {
      if (!trainer) throw new Error('No trainer');
      return apiFetch<OwnerTrainer>(`/owner/trainers/${trainer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !isTrainerActive(trainer) }),
      });
    },
    onSuccess: () => {
      setError(null);
      onChanged();
    },
    onError: (err: unknown) => {
      setError(
        err instanceof ApiError ? err.message : t('trainerToggleFailed'),
      );
    },
  });

  const active = trainer ? isTrainerActive(trainer) : false;

  return (
    <AnimatePresence>
      {open && trainer ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label={t('closePreview')}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={`trainer-preview-${trainer.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[rgba(214,255,62,0.2)] bg-[#12141a] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          >
            {mode === 'preview' ? (
              <>
                <div className="relative aspect-[4/5] max-h-[52vh] overflow-hidden bg-[var(--surface)] sm:aspect-[3/4]">
                  <SafeImage
                    src={trainer.photoUrl}
                    alt={trainer.name}
                    fill
                    className="object-cover object-[center_18%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/20" />
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-black/45 text-[var(--muted)] backdrop-blur-sm transition hover:border-[rgba(214,255,62,0.35)] hover:text-[var(--text)]"
                    aria-label={t('closePreview')}
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="eyebrow !normal-case !tracking-[0.08em]">
                        {specLabel}
                      </p>
                      <span
                        className={
                          active
                            ? 'rounded-full border border-[rgba(214,255,62,0.35)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'
                            : 'rounded-full border border-[rgba(255,255,255,0.16)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]'
                        }
                      >
                        {active ? t('trainerActive') : t('trainerInactive')}
                      </span>
                    </div>
                    <h2
                      id={`trainer-preview-${trainer.id}`}
                      className="display mt-2 text-3xl font-bold"
                    >
                      {trainer.name}
                    </h2>
                  </div>
                  {trainer.bio ? (
                    <p className="text-sm leading-relaxed text-[rgba(244,241,236,0.84)]">
                      {localizeText(trainer.bio, locale)}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">{t('noTrainerBio')}</p>
                  )}
                  {error ? (
                    <p className="text-sm text-[var(--accent-hot)]">{error}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-ghost disabled:opacity-60"
                      disabled={toggleActive.isPending}
                      onClick={() => toggleActive.mutate()}
                    >
                      {toggleActive.isPending
                        ? t('saving')
                        : active
                          ? t('deactivateTrainer')
                          : t('activateTrainer')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="display text-2xl font-bold">{t('editTrainer')}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[rgba(214,255,62,0.35)] hover:text-[var(--text)]"
                    aria-label={t('closePreview')}
                  >
                    ✕
                  </button>
                </div>
                <OwnerTrainerEditor
                  draft={draft}
                  onChange={setDraft}
                  onSave={() => save.mutate()}
                  onCancel={() => {
                    setMode('preview');
                    setError(null);
                    onEditChange?.(false);
                  }}
                  onDelete={() => remove.mutate()}
                  saving={save.isPending}
                  deleting={remove.isPending}
                  error={error}
                  isNew={false}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
