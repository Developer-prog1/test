'use client';

import { useTranslations } from 'next-intl';
import { AdminGymList } from '../../../../shared/ui/admin-gym-list';

export default function AdminModerationPage() {
  const t = useTranslations('admin');
  return (
    <AdminGymList
      status="PENDING"
      title={t('navModeration')}
      emptyLabel={t('emptyPending')}
    />
  );
}
