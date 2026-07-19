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

function TrainersIcon() {
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
        d="M19 19v-1a3 3 0 0 0-2-2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5.2a3 3 0 0 1 0 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </PortalIcon>
  );
}

function ScheduleIcon() {
  return (
    <PortalIcon>
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
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
        href: '/owner/trainers',
        label: t('navTrainers'),
        match: 'exact' as const,
        icon: TrainersIcon,
      },
      {
        href: '/owner/schedule',
        label: t('navSchedule'),
        match: 'exact' as const,
        icon: ScheduleIcon,
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
