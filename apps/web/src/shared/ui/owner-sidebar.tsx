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

function GymIcon() {
  return (
    <PortalIcon>
      <path
        d="M7 8v8M17 8v8M7 12h10M5 10v4M19 10v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </PortalIcon>
  );
}

export function OwnerSidebar() {
  const t = useTranslations('owner');

  const items = useMemo(
    () => [
      {
        href: '/owner',
        label: t('navOverview'),
        match: 'exact' as const,
        icon: OverviewIcon,
      },
      {
        href: '/owner/gym',
        label: t('navGym'),
        match: 'exact' as const,
        icon: GymIcon,
      },
      {
        href: '/owner/settings',
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
