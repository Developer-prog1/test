'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../../i18n/navigation';

const NAV_ITEMS = [
  {
    href: '/admin',
    key: 'navOverview',
    match: 'exact' as const,
    icon: OverviewIcon,
  },
  {
    href: '/admin/gyms',
    key: 'navGyms',
    match: 'prefix' as const,
    icon: GymsIcon,
  },
  {
    href: '/admin/moderation',
    key: 'navModeration',
    match: 'exact' as const,
    icon: ModerationIcon,
  },
  {
    href: '/admin/owners',
    key: 'navOwners',
    match: 'exact' as const,
    icon: OwnersIcon,
  },
  {
    href: '/admin/subscriptions',
    key: 'navSubscriptions',
    match: 'exact' as const,
    icon: SubsIcon,
  },
] as const;

function isActive(
  pathname: string,
  href: string,
  match: 'exact' | 'prefix',
): boolean {
  if (match === 'exact') return pathname === href;
  if (href === '/admin/gyms') {
    return pathname === '/admin/gyms' || pathname.startsWith('/admin/gyms/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GymsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModerationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M12 3 4.5 6.5v5c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9v-5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.8 1.8 3.7-3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OwnersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M16 19v-1.2A3.8 3.8 0 0 0 12.2 14H7.8A3.8 3.8 0 0 0 4 17.8V19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M20 19v-1a3 3 0 0 0-2.2-2.9M16.5 5.2a3 3 0 0 1 0 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SubsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <rect
        x="3.5"
        y="6"
        width="17"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 10.5h17M8 14.5h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type NavPanelProps = {
  onNavigate?: () => void;
};

function NavPanel({ onNavigate }: NavPanelProps) {
  const t = useTranslations('admin');
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
          {t('portalSubtitle')}
        </p>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          const Icon = item.icon;
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
                    : 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl !text-[rgba(214,255,62,0.55)] transition group-hover:!text-[var(--accent)] group-hover:bg-[rgba(255,255,255,0.04)]'
                }
              >
                <Icon />
              </span>
              {t(item.key)}
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

export function AdminSidebar() {
  const t = useTranslations('admin');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div>
          <p className="display text-lg font-semibold">{t('title')}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {t('portalSubtitle')}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost !px-3 !py-2 text-sm"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? t('closeMenu') : t('openMenu')}
        </button>
      </div>

      {mobileOpen ? (
        <aside className="mb-6 overflow-hidden rounded-[1.75rem] border border-[rgba(244,241,236,0.1)] bg-[linear-gradient(165deg,rgba(28,31,38,0.99),rgba(20,22,28,0.99))] shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] lg:hidden">
          <NavPanel onNavigate={() => setMobileOpen(false)} />
        </aside>
      ) : null}

      <aside
        className="fixed bottom-0 left-0 top-[calc(var(--header-height)+0.35rem)] z-40 hidden w-[var(--admin-sidebar-width)] overflow-hidden border border-b-0 border-l-0 border-[rgba(244,241,236,0.1)] bg-[linear-gradient(165deg,rgba(26,29,36,0.98)_0%,rgba(18,20,26,0.99)_50%,rgba(15,17,22,1)_100%)] shadow-[12px_0_48px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(214,255,62,0.06),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl lg:block"
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
        <NavPanel />
      </aside>
    </>
  );
}
