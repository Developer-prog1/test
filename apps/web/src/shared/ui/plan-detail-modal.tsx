'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';

export type PlanModalData = {
  id: string;
  title: string;
  description: string | null;
  priceAmd: number;
  durationDays: number | null;
};

type PlanDetailModalProps = {
  plan: PlanModalData | null;
  gymName: string;
  open: boolean;
  onClose: () => void;
  currencyLabel?: string;
  labels: {
    title: string;
    close: string;
    duration: string;
    days: string;
    includes: string;
    perkAccess: string;
    perkSupport: string;
    perkFlexible: string;
    cta: string;
  };
};

export function PlanDetailModal({
  plan,
  gymName,
  open,
  onClose,
  currencyLabel = 'AMD',
  labels,
}: PlanDetailModalProps) {
  const reduceMotion = useReducedMotion();

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

  return (
    <AnimatePresence>
      {open && plan ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label={labels.close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={`plan-modal-${plan.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-[rgba(214,255,62,0.2)] bg-[#12141a] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[rgba(214,255,62,0.14)] to-transparent" />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{labels.title}</p>
                  <h2
                    id={`plan-modal-${plan.id}`}
                    className="display mt-3 text-3xl font-bold sm:text-4xl"
                  >
                    {plan.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{gymName}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[rgba(214,255,62,0.35)] hover:text-[var(--text)]"
                  aria-label={labels.close}
                >
                  ✕
                </button>
              </div>

              <p className="display mt-6 text-4xl font-bold sm:text-5xl">
                {plan.priceAmd.toLocaleString()}
                <span className="ml-2 text-lg font-medium text-[var(--accent)]">
                  {currencyLabel}
                </span>
              </p>

              {plan.durationDays ? (
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[rgba(214,255,62,0.75)]">
                  {labels.duration}: {plan.durationDays} {labels.days}
                </p>
              ) : null}

              <p className="mt-5 text-base leading-relaxed text-[rgba(244,241,236,0.88)]">
                {plan.description ?? labels.perkAccess}
              </p>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {labels.includes}
                </p>
                <ul className="space-y-2">
                  {[labels.perkAccess, labels.perkSupport, labels.perkFlexible].map(
                    (perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-3.5 py-3 text-sm text-[var(--text)]"
                      >
                        <span className="mt-0.5 text-[var(--accent)]">✓</span>
                        <span>{perk}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary mt-8 w-full"
              >
                {labels.cta}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
