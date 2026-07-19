'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import { Link } from '../../../../i18n/navigation';
import { Reveal } from '../../../../shared/ui/reveal';
import {
  emptyOwnerTrainerDraft,
  OwnerTrainerEditor,
  OwnerTrainerGridCard,
  OwnerTrainerPreviewModal,
  type OwnerTrainer,
} from '../../../../shared/ui/owner-trainer-editor';

export default function OwnerTrainersPage() {
  const t = useTranslations('owner');
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyOwnerTrainerDraft);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const trainers = useQuery({
    queryKey: ['owner-trainers'],
    queryFn: () => apiFetch<OwnerTrainer[]>('/owner/trainers'),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<OwnerTrainer>('/owner/trainers', {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name.trim(),
          photoUrl: draft.photoUrl.trim() || undefined,
          specialization: draft.specialization || undefined,
          bio: draft.bio.trim() || undefined,
        }),
      }),
    onSuccess: async (created) => {
      setCreateError(null);
      setDraft(emptyOwnerTrainerDraft());
      setAdding(false);
      await qc.invalidateQueries({ queryKey: ['owner-trainers'] });
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
      setSelectedId(created.id);
    },
    onError: (err: unknown) => {
      setCreateError(
        err instanceof ApiError ? err.message : t('trainerSaveFailed'),
      );
    },
  });

  function refresh() {
    void qc.invalidateQueries({ queryKey: ['owner-trainers'] });
    void qc.invalidateQueries({ queryKey: ['owner-gym'] });
  }

  if (trainers.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  if (trainers.isLoading) {
    return <p className="text-[var(--muted)]">{t('loadingTrainers')}</p>;
  }

  const items = trainers.data ?? [];
  const selected =
    items.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-4xl font-bold">{t('trainersTitle')}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t('trainersSubtitle')}
            </p>
          </div>
          {!adding ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setDraft(emptyOwnerTrainerDraft());
                setCreateError(null);
                setAdding(true);
              }}
            >
              {t('addTrainer')}
            </button>
          ) : null}
        </div>
      </Reveal>

      {adding ? (
        <Reveal>
          <section className="card-glass space-y-4 p-5">
            <h2 className="display text-xl font-semibold">{t('newTrainer')}</h2>
            <OwnerTrainerEditor
              draft={draft}
              onChange={setDraft}
              onSave={() => create.mutate()}
              onCancel={() => {
                setAdding(false);
                setCreateError(null);
              }}
              saving={create.isPending}
              error={createError}
              isNew
            />
          </section>
        </Reveal>
      ) : null}

      {items.length === 0 && !adding ? (
        <p className="text-sm text-[var(--muted)]">{t('emptyTrainers')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((trainer, index) => (
            <Reveal key={trainer.id} delay={index * 0.04}>
              <OwnerTrainerGridCard
                trainer={trainer}
                onOpen={() => setSelectedId(trainer.id)}
              />
            </Reveal>
          ))}
        </div>
      )}

      <OwnerTrainerPreviewModal
        trainer={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        onChanged={refresh}
      />
    </div>
  );
}
