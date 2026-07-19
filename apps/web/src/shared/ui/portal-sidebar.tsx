'use client';

import { useState, type ReactNode } from 'react';
import { Link, usePathname } from '../../i18n/navigation';

export type PortalNavItem = {
  href: string;
  label: string;
  match: 'exact' | 'prefix';
  icon: () => ReactNode;
};

type PortalSidebarProps = {
  mobileTitle: string;
  subtitle: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  items: PortalNavItem[];
};

function isActive(
  pathname: string,
  href: string,
  match: 'exact' | 'prefix',
): boolean {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavPanel({
  items,
  subtitle,
  onNavigate,
}: {
  items: PortalNavItem[];
  subtitle: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(214,255,62,0.08),transparent_70%)]"
      />
      <div className="relative border-b border-[rgba(244,241,236,0.06)] px-5 pb-6 pt-7">
        <Link
          href="/"
          onClick={onNavigate}
          className="display group inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(214,255,62,0.65)] transition group-hover:scale-125"
          />
          <span>
            Gym<span className="text-[var(--accent)]">Hub</span>
          </span>
        </Link>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(155,150,140,0.75)]">
          {subtitle}
        </p>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={
                active
                  ? 'group relative flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,rgba(214,255,62,0.14),rgba(214,255,62,0.04))] px-3.5 py-2.5 text-sm font-semibold !text-[var(--text)] shadow-[inset_0_0_0_1px_rgba(214,255,62,0.22)] transition'
                  : 'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium !text-[rgba(244,241,236,0.55)] transition duration-200 hover:bg-[rgba(255,255,255,0.035)] hover:!text-[rgba(244,241,236,0.92)]'
              }
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(214,255,62,0.7)]"
                />
              ) : null}
              <span
                className={
                  active
                    ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(214,255,62,0.16)] !text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(214,255,62,0.2)]'
                    : 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl !text-[rgba(214,255,62,0.55)] transition group-hover:bg-[rgba(255,255,255,0.04)] group-hover:!text-[var(--accent)]'
                }
              >
                {item.icon()}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-5 pb-5 pt-2">
        <div
          aria-hidden
          className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(214,255,62,0.2)] to-transparent"
        />
      </div>
    </div>
  );
}

export function PortalSidebar({
  mobileTitle,
  subtitle,
  openMenuLabel,
  closeMenuLabel,
  items,
}: PortalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div>
          <p className="display text-lg font-semibold">{mobileTitle}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost !px-3 !py-2 text-sm"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? closeMenuLabel : openMenuLabel}
        </button>
      </div>

      {mobileOpen ? (
        <aside className="mb-6 overflow-hidden rounded-[1.75rem] border border-[rgba(244,241,236,0.12)] bg-[linear-gradient(165deg,rgba(36,40,50,0.99),rgba(26,29,36,0.99))] shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] lg:hidden">
          <NavPanel
            items={items}
            subtitle={subtitle}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      ) : null}

      <aside
        className="fixed bottom-0 left-0 top-[calc(var(--header-height)+0.85rem)] z-40 hidden w-[var(--admin-sidebar-width)] overflow-hidden border border-b-0 border-l-0 border-[rgba(244,241,236,0.12)] bg-[linear-gradient(165deg,rgba(34,38,48,0.98)_0%,rgba(24,27,34,0.99)_50%,rgba(20,23,30,1)_100%)] shadow-[12px_0_48px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(214,255,62,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl lg:block"
        style={{
          borderTopRightRadius: '2.25rem',
          borderBottomLeftRadius: '2.25rem',
          borderBottomRightRadius: '2.25rem',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-[rgba(214,255,62,0.18)] to-transparent"
        />
        <NavPanel items={items} subtitle={subtitle} />
      </aside>
    </>
  );
}

export function PortalIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      {children}
    </svg>
  );
}

/** Clean gear — matches product accent stroke style in portal nav. */
export function SettingsNavIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4"
    >
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
