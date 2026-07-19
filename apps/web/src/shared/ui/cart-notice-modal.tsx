'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from '../../i18n/navigation';

type CartNoticeModalProps = {
  open: boolean;
  mode: 'added' | 'removed';
  onClose: () => void;
  labels: {
    added: string;
    removed: string;
    viewCart: string;
    close: string;
  };
};

export function CartNoticeModal({
  open,
  mode,
  onClose,
  labels,
}: CartNoticeModalProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    const timer = window.setTimeout(onClose, 2800);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const message = mode === 'added' ? labels.added : labels.removed;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label={labels.close}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[#14161c] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          >
            <p className="display text-2xl font-semibold text-[var(--text)]">
              {message}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {mode === 'added' ? (
                <Link
                  href="/favorites"
                  className="btn btn-primary !px-4 !py-2 text-sm"
                  onClick={onClose}
                >
                  {labels.viewCart}
                </Link>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost !px-4 !py-2 text-sm"
                onClick={onClose}
              >
                {labels.close}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
