'use client';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
  ariaLabel?: string;
};

function buildPageItems(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push('ellipsis');
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }
  if (end < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);

  return items;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className="mt-12 flex flex-col items-center gap-5 sm:gap-6"
    >
      <p className="text-sm text-[var(--muted)]">{pageLabel}</p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(244,241,236,0.12)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[rgba(214,255,62,0.35)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">{previousLabel}</span>
        </button>

        <div className="flex items-center gap-1.5 rounded-full border border-[rgba(244,241,236,0.1)] bg-[#12141a]/80 p-1.5 backdrop-blur-md">
          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-[var(--muted)]"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={
                  item === page
                    ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--accent)] px-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(214,255,62,0.25)]'
                    : 'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text)]'
                }
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(244,241,236,0.12)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[rgba(214,255,62,0.35)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </nav>
  );
}
