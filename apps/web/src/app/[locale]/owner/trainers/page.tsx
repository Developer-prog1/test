'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import { Link, usePathname, useRouter } from '../../../../i18n/navigation';
import { Reveal } from '../../../../shared/ui/reveal';
import {
  emptyOwnerTrainerDraft,
  OwnerTrainerEditor,
  OwnerTrainerGridCard,
  OwnerTrainerPreviewModal,
  type OwnerTrainer,
} from '../../../../shared/ui/owner-trainer-editor';

/** URL shape: ?name=Aram/Sargsyan [&edit=1] */
function trainerNameToQuery(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]}/${parts.slice(1).join(' ')}`;
}

function findTrainerByNameQuery(
  items: OwnerTrainer[],
  raw: string,
): OwnerTrainer | undefined {
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  if (!decoded) return undefined;

  const asFullName = decoded.replace(/\//g, ' ').replace(/\s+/g, ' ');
  const exact = items.find(
    (item) => item.name.trim().toLowerCase() === asFullName,
  );
  if (exact) return exact;

  return items.find(
    (item) => trainerNameToQuery(item.name).toLowerCase() === decoded,
  );
}

function OwnerTrainersPageContent() {
  const t = useTranslations('owner');
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyOwnerTrainerDraft);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const nameParam = searchParams.get('name');
  const editParam = searchParams.get('edit') === '1';

  const trainers = useQuery({
    queryKey: ['owner-trainers'],
    queryFn: () => apiFetch<OwnerTrainer[]>('/owner/trainers'),
  });

  const items = trainers.data ?? [];

  const selected = useMemo(() => {
    if (!nameParam) return null;
    return findTrainerByNameQuery(items, nameParam) ?? null;
  }, [items, nameParam]);

  const openInEdit = Boolean(selected) && editParam;

  function writeTrainerUrl(trainer: OwnerTrainer | null, edit: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (!trainer) {
      params.delete('name');
      params.delete('edit');
    } else {
      params.set('name', trainerNameToQuery(trainer.name));
      if (edit) params.set('edit', '1');
      else params.delete('edit');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (!nameParam || trainers.isLoading || !trainers.data) return;
    if (findTrainerByNameQuery(trainers.data, nameParam)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('name');
    params.delete('edit');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    nameParam,
    pathname,
    router,
    searchParams,
    trainers.data,
    trainers.isLoading,
  ]);

  const create = useMutation({
    mutationFn: () =>
      apiFetch<OwnerTrainer>('/owner/trainers', {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name.trim(),
          photoUrl: draft.photoUrl.trim() || undefined,
          specialization: draft.specialization || undefined,
          bio: draft.bio.trim() || undefined,
          isActive: true,
        }),
      }),
    onSuccess: async (created) => {
      setCreateError(null);
      setDraft(emptyOwnerTrainerDraft());
      setAdding(false);
      await qc.invalidateQueries({ queryKey: ['owner-trainers'] });
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
      writeTrainerUrl(created, false);
    },
    onError: (err: unknown) => {
      setCreateError(
        err instanceof ApiError ? err.message : t('trainerSaveFailed'),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/owner/trainers/${id}`, { method: 'DELETE' }),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: async (_data, id) => {
      if (selected?.id === id) {
        writeTrainerUrl(null, false);
      }
      await qc.invalidateQueries({ queryKey: ['owner-trainers'] });
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<OwnerTrainer>(`/owner/trainers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !isActive }),
      }),
    onMutate: ({ id }) => {
      setTogglingId(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['owner-trainers'] });
      await qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
    onSettled: () => {
      setTogglingId(null);
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
                onOpen={() => writeTrainerUrl(trainer, false)}
                onEdit={() => writeTrainerUrl(trainer, true)}
                onDelete={() => remove.mutate(trainer.id)}
                onToggleActive={() =>
                  toggleActive.mutate({
                    id: trainer.id,
                    isActive: trainer.isActive !== false,
                  })
                }
                deleting={deletingId === trainer.id}
                toggling={togglingId === trainer.id}
              />
            </Reveal>
          ))}
        </div>
      )}

      <OwnerTrainerPreviewModal
        trainer={selected}
        open={Boolean(selected)}
        startInEdit={openInEdit}
        onClose={() => writeTrainerUrl(null, false)}
        onEditChange={(editing) => {
          if (selected) writeTrainerUrl(selected, editing);
        }}
        onChanged={refresh}
      />
    </div>
  );
}

export default function OwnerTrainersPage() {
  const t = useTranslations('owner');

  return (
    <Suspense
      fallback={<p className="text-[var(--muted)]">{t('loadingTrainers')}</p>}
    >
      <OwnerTrainersPageContent />
    </Suspense>
  );
}
