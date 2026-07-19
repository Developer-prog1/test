'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PortalIcon, PortalSidebar, SettingsNavIcon } from './portal-sidebar';

function OverviewIcon() {
  return (
    <PortalIcon>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </PortalIcon>
  );
}

function GymsIcon() {
  return (
    <PortalIcon>
      <path
        d="M7 8v8M17 8v8M4 10v4M20 10v4M7 12h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </PortalIcon>
  );
}

function ModerationIcon() {
  return (
    <PortalIcon>
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
    </PortalIcon>
  );
}

function OwnersIcon() {
  return (
    <PortalIcon>
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
    </PortalIcon>
  );
}

function SubsIcon() {
  return (
    <PortalIcon>
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
    </PortalIcon>
  );
}

export function AdminSidebar() {
  const t = useTranslations('admin');

  const items = useMemo(
    () => [
      {
        href: '/admin',
        label: t('navOverview'),
        match: 'exact' as const,
        icon: OverviewIcon,
      },
      {
        href: '/admin/gyms',
        label: t('navGyms'),
        match: 'prefix' as const,
        icon: GymsIcon,
      },
      {
        href: '/admin/moderation',
        label: t('navModeration'),
        match: 'exact' as const,
        icon: ModerationIcon,
      },
      {
        href: '/admin/owners',
        label: t('navOwners'),
        match: 'exact' as const,
        icon: OwnersIcon,
      },
      {
        href: '/admin/subscriptions',
        label: t('navSubscriptions'),
        match: 'exact' as const,
        icon: SubsIcon,
      },
      {
        href: '/admin/settings',
        label: t('navSettings'),
        match: 'exact' as const,
        icon: SettingsNavIcon,
      },
    ],
    [t],
  );

  return (
    <PortalSidebar
      mobileTitle={t('title')}
      subtitle={t('portalSubtitle')}
      openMenuLabel={t('openMenu')}
      closeMenuLabel={t('closeMenu')}
      items={items}
    />
  );
}
