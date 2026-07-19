'use client';

import { useTranslations } from 'next-intl';
import { AdminGymList } from '../../../../shared/ui/admin-gym-list';

export default function AdminGymsPage() {
  const t = useTranslations('admin');
  return (
    <AdminGymList title={t('navGyms')} emptyLabel={t('emptyGyms')} />
  );
}
