'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export type ConfirmDialogTone = 'danger' | 'warning' | 'accent';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  tone = 'danger',
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  tone?: ConfirmDialogTone;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('owner');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onCancel();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, pending, onCancel]);

  const confirmClass =
    tone === 'danger'
      ? 'btn border border-[rgba(255,92,92,0.45)] bg-[rgba(255,92,92,0.16)] text-[#ff9a9a] hover:bg-[rgba(255,92,92,0.28)] disabled:opacity-60'
      : tone === 'warning'
        ? 'btn border border-[rgba(255,180,80,0.45)] bg-[rgba(255,180,80,0.14)] text-[#ffb45c] hover:bg-[rgba(255,180,80,0.26)] disabled:opacity-60'
        : 'btn btn-primary disabled:opacity-60';

  const iconRing =
    tone === 'danger'
      ? 'border-[rgba(255,92,92,0.35)] bg-[rgba(255,92,92,0.12)] text-[#ff8d8d]'
      : tone === 'warning'
        ? 'border-[rgba(255,180,80,0.35)] bg-[rgba(255,180,80,0.12)] text-[#ffb45c]'
        : 'border-[rgba(214,255,62,0.35)] bg-[rgba(214,255,62,0.12)] text-[var(--accent)]';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label={cancelLabel ?? t('confirmCancel')}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            disabled={pending}
            onClick={() => {
              if (!pending) onCancel();
            }}
          />

          <motion.div
            role="alertdialog"
            aria-modal
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[rgba(214,255,62,0.18)] bg-[#12141a] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6"
          >
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border ${iconRing}`}
              aria-hidden
            >
              {tone === 'danger' ? <TrashGlyph /> : <PauseGlyph />}
            </div>

            <h2
              id="confirm-dialog-title"
              className="display text-2xl font-bold"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-sm leading-relaxed text-[var(--muted)]"
            >
              {description}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-ghost disabled:opacity-60"
                disabled={pending}
                onClick={onCancel}
              >
                {cancelLabel ?? t('confirmCancel')}
              </button>
              <button
                type="button"
                className={confirmClass}
                disabled={pending}
                onClick={onConfirm}
              >
                {pending ? pendingLabel ?? t('saving') : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function TrashGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M10 9v6M14 9v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
