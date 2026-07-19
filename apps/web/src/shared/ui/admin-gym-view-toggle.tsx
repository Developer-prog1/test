'use client';

type AdminViewMode = 'list' | 'board';

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="3.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="13.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

type AdminGymViewToggleProps = {
  view: AdminViewMode;
  onChange: (view: AdminViewMode) => void;
  ariaLabel: string;
  listLabel: string;
  boardLabel: string;
};

export function AdminGymViewToggle({
  view,
  onChange,
  ariaLabel,
  listLabel,
  boardLabel,
}: AdminGymViewToggleProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-full border border-[rgba(244,241,236,0.12)] bg-[rgba(255,255,255,0.03)] p-1"
    >
      <button
        type="button"
        aria-pressed={view === 'list'}
        title={listLabel}
        onClick={() => onChange('list')}
        className={
          view === 'list'
            ? 'inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold !text-[#111]'
            : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]'
        }
      >
        <ListIcon />
        <span className="hidden sm:inline">{listLabel}</span>
      </button>
      <button
        type="button"
        aria-pressed={view === 'board'}
        title={boardLabel}
        onClick={() => onChange('board')}
        className={
          view === 'board'
            ? 'inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold !text-[#111]'
            : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]'
        }
      >
        <BoardIcon />
        <span className="hidden sm:inline">{boardLabel}</span>
      </button>
    </div>
  );
}

export type { AdminViewMode };
