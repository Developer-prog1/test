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
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--line)] px-5 pb-5 pt-6">
        <Link href="/" onClick={onNavigate} className="display text-2xl font-bold">
          Gym<span className="text-[var(--accent)]">Hub</span>
        </Link>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {t('portalSubtitle')}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4">
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
                  ? 'flex items-center gap-3 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold !text-[#111] shadow-[0_8px_24px_rgba(214,255,62,0.2)]'
                  : 'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium !text-[rgba(244,241,236,0.72)] transition hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--text)]'
              }
            >
              <span className={active ? '!text-[#111]' : '!text-[var(--accent)]'}>
                <Icon />
              </span>
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
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
        <aside className="mb-6 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--bg-elevated)] lg:hidden">
          <NavPanel onNavigate={() => setMobileOpen(false)} />
        </aside>
      ) : null}

      <aside
        className="fixed bottom-0 left-0 top-[calc(var(--header-height)+0.35rem)] z-40 hidden w-[var(--admin-sidebar-width)] overflow-hidden border border-b-0 border-l-0 border-[var(--line)] bg-[linear-gradient(180deg,rgba(24,27,34,0.98),rgba(18,20,26,0.98))] shadow-[8px_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block"
        style={{
          borderTopRightRadius: '2.25rem',
          borderBottomLeftRadius: '2.25rem',
          borderBottomRightRadius: '2.25rem',
        }}
      >
        <NavPanel />
      </aside>
    </>
  );
}
