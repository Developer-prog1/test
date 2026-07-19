'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import { Link } from '../../../../i18n/navigation';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog';
import { Reveal } from '../../../../shared/ui/reveal';

type ListingPackage = {
  id: string;
  code: string;
  months: number;
  priceAmd: number;
  popular: boolean;
  isActive: boolean;
  sortOrder: number;
};

type PackageDraft = {
  code: string;
  months: string;
  priceAmd: string;
  popular: boolean;
  isActive: boolean;
  sortOrder: string;
};

function emptyDraft(): PackageDraft {
  return {
    code: '',
    months: '1',
    priceAmd: '10000',
    popular: false,
    isActive: true,
    sortOrder: '0',
  };
}

function toDraft(pack: ListingPackage): PackageDraft {
  return {
    code: pack.code,
    months: String(pack.months),
    priceAmd: String(pack.priceAmd),
    popular: pack.popular,
    isActive: pack.isActive,
    sortOrder: String(pack.sortOrder),
  };
}

function parseDraft(draft: PackageDraft): {
  code: string;
  months: number;
  priceAmd: number;
  popular: boolean;
  isActive: boolean;
  sortOrder: number;
} | null {
  const months = Number(draft.months);
  const priceAmd = Number(draft.priceAmd);
  const sortOrder = Number(draft.sortOrder);
  if (
    !draft.code.trim() ||
    !Number.isFinite(months) ||
    months < 1 ||
    !Number.isFinite(priceAmd) ||
    priceAmd < 0 ||
    !Number.isFinite(sortOrder) ||
    sortOrder < 0
  ) {
    return null;
  }
  return {
    code: draft.code.trim().toLowerCase(),
    months: Math.round(months),
    priceAmd: Math.round(priceAmd),
    popular: draft.popular,
    isActive: draft.isActive,
    sortOrder: Math.round(sortOrder),
  };
}

export default function AdminPackagesPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const qc = useQueryClient();
  const [draft, setDraft] = useState<PackageDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingPackage | null>(null);

  const packages = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => apiFetch<ListingPackage[]>('/admin/packages'),
  });

  useEffect(() => {
    if (!editingId || !packages.data) return;
    const current = packages.data.find((item) => item.id === editingId);
    if (current) setDraft(toDraft(current));
  }, [editingId, packages.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = parseDraft(draft);
      if (!payload) {
        throw new ApiError(400, 'VALIDATION_ERROR', t('packageValidationError'));
      }
      if (editingId) {
        return apiFetch<ListingPackage>(`/admin/packages/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch<ListingPackage>('/admin/packages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      setFormError(null);
      setCreating(false);
      setEditingId(null);
      setDraft(emptyDraft());
      await qc.invalidateQueries({ queryKey: ['admin-packages'] });
      await qc.invalidateQueries({ queryKey: ['owner-sub'] });
    },
    onError: (err: unknown) => {
      setFormError(
        err instanceof ApiError ? err.message : t('packageSaveFailed'),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/packages/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ['admin-packages'] });
      await qc.invalidateQueries({ queryKey: ['owner-sub'] });
    },
  });

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError(null);
  }

  function startEdit(pack: ListingPackage) {
    setCreating(false);
    setEditingId(pack.id);
    setDraft(toDraft(pack));
    setFormError(null);
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  if (packages.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  const items = packages.data ?? [];
  const showForm = creating || Boolean(editingId);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-3xl font-bold sm:text-4xl">
              {t('packagesTitle')}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {packages.isLoading
                ? t('loading')
                : t('packagesSubtitle', { count: items.length })}
            </p>
          </div>
          {!showForm ? (
            <button type="button" className="btn btn-primary" onClick={startCreate}>
              {t('addPackage')}
            </button>
          ) : null}
        </div>
      </Reveal>

      {showForm ? (
        <Reveal>
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5"
          >
            <h2 className="display text-xl font-semibold">
              {editingId ? t('editPackage') : t('addPackage')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--muted)]">{t('packageCode')}</span>
                <input
                  className="input"
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="3m"
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--muted)]">{t('packageSortOrder')}</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={draft.sortOrder}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, sortOrder: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--muted)]">{t('packageMonths')}</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={draft.months}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, months: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--muted)]">
                  {t('packagePrice')} ({tCommon('currency')})
                </span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={draft.priceAmd}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, priceAmd: e.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.popular}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, popular: e.target.checked }))
                  }
                />
                {t('packagePopular')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                {t('packageActive')}
              </label>
            </div>
            {formError ? (
              <p className="text-sm text-[var(--accent-hot)]">{formError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-primary disabled:opacity-60"
                disabled={save.isPending}
              >
                {save.isPending ? t('saving') : t('savePackage')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cancelForm}
                disabled={save.isPending}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </Reveal>
      ) : null}

      {!packages.isLoading && items.length === 0 ? (
        <p className="text-[var(--muted)]">{t('emptyPackages')}</p>
      ) : null}

      <div className="space-y-3">
        {items.map((pack, index) => (
          <Reveal key={pack.id} delay={index * 0.03}>
            <article className="flex flex-col gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {t('packageDuration', { months: pack.months })}
                  </p>
                  <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {pack.code}
                  </span>
                  {pack.popular ? (
                    <span className="rounded-full border border-[rgba(214,255,62,0.35)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                      {t('packagePopular')}
                    </span>
                  ) : null}
                  <span
                    className={
                      pack.isActive
                        ? 'rounded-full border border-[rgba(214,255,62,0.35)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]'
                        : 'rounded-full border border-[rgba(255,255,255,0.16)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]'
                    }
                  >
                    {pack.isActive ? t('packageActive') : t('packageInactive')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {pack.priceAmd.toLocaleString()} {tCommon('currency')} ·{' '}
                  {t('packageSortOrder')}: {pack.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => startEdit(pack)}
                >
                  {t('edit')}
                </button>
                <button
                  type="button"
                  className="btn border border-[rgba(255,92,92,0.35)] text-[#ff8d8d]"
                  onClick={() => setDeleteTarget(pack)}
                >
                  {t('delete')}
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        tone="danger"
        title={t('confirmDeletePackageTitle')}
        description={t('confirmDeletePackageBody', {
          code: deleteTarget?.code ?? '',
        })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        pendingLabel={t('saving')}
        pending={remove.isPending}
        onCancel={() => {
          if (!remove.isPending) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
