'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

export type SelectOption = {
  value: string;
  label: string;
};

type DarkSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  className?: string;
  'aria-label'?: string;
};

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[var(--accent)]' : 'text-[var(--muted)]'}`}
    >
      <path
        d="M2.5 4.25L6 7.75L9.5 4.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7.2L5.6 10.2L11.5 3.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Canonical dropdown for GymHub web UI (filters, forms, settings).
 * Always reuse this instead of native `<select>` or a one-off menu.
 * @see docs/DECISIONS.md ADR-009
 */
export function DarkSelect({
  value,
  onChange,
  options,
  name,
  className,
  'aria-label': ariaLabel,
}: DarkSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const selected = options.find((item) => item.value === value) ?? options[0];

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const menuHeight = Math.min(options.length * 48 + 24, 280);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight + 16 && rect.top > spaceBelow;

      setCoords({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[data-dark-select-menu]')) return;
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && coords ? (
          <motion.div
            data-dark-select-menu
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: coords.openUp ? 8 : -8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }
            }
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              left: coords.left,
              width: coords.width,
              top: coords.openUp ? undefined : coords.top,
              bottom: coords.openUp
                ? window.innerHeight - coords.top
                : undefined,
              zIndex: 200,
            }}
            className="origin-top"
          >
            <div className="overflow-hidden rounded-2xl border border-[rgba(214,255,62,0.35)] bg-[#14161c] shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
              <ul
                id={listId}
                role="listbox"
                aria-label={ariaLabel}
                className="scrollbar-dark max-h-64 overflow-auto p-2"
              >
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <li key={option.value || '__empty'} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                        className={
                          active
                            ? 'flex w-full items-center justify-between gap-3 rounded-xl bg-[rgba(214,255,62,0.16)] px-3.5 py-3 text-left text-sm font-semibold text-[var(--accent)]'
                            : 'flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:bg-[rgba(255,255,255,0.07)]'
                        }
                      >
                        <span className="truncate">{option.label}</span>
                        {active ? (
                          <span className="text-[var(--accent)]">
                            <CheckIcon />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className ?? 'max-w-xs'}`}
    >
      <select
        name={name}
        value={value}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || '__empty'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={
          open
            ? 'flex w-full items-center justify-between gap-3 rounded-2xl border border-[rgba(214,255,62,0.55)] bg-[rgba(214,255,62,0.1)] px-4 py-3 text-left text-sm text-[var(--text)] shadow-[0_0_0_3px_rgba(214,255,62,0.12)] transition duration-200 focus:outline-none'
            : 'flex w-full items-center justify-between gap-3 rounded-2xl border border-[rgba(244,241,236,0.14)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-left text-sm text-[var(--text)] transition duration-200 hover:border-[rgba(214,255,62,0.4)] hover:bg-[rgba(255,255,255,0.06)] focus:outline-none focus:ring-2 focus:ring-[rgba(214,255,62,0.35)]'
        }
      >
        <span className="truncate font-medium tracking-wide">
          {selected?.label}
        </span>
        <Chevron open={open} />
      </button>

      {menu}
    </div>
  );
}
