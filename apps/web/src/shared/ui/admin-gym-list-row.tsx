'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import { Reveal } from './reveal';

type AdminGymListRowProps = {
  gym: {
    id: string;
    name: string;
    moderationStatus: string;
    isFeatured: boolean;
    owner: { email: string };
  };
  index: number;
  statusLabel: string;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
  onActivate: () => void;
};

export function AdminGymListRow({
  gym,
  index,
  statusLabel,
  onApprove,
  onReject,
  onToggleFeatured,
  onActivate,
}: AdminGymListRowProps) {
  const t = useTranslations('admin');

  return (
    <Reveal delay={Math.min(index * 0.03, 0.25)}>
      <div className="card-glass flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-medium">
            {gym.name}{' '}
            <span className="text-sm text-[var(--muted)]">({statusLabel})</span>
          </p>
          <p className="text-sm text-[var(--muted)]">{gym.owner.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/gyms/${gym.id}`}
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
          >
            {t('edit')}
          </Link>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={onApprove}
          >
            {t('approve')}
          </button>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={onReject}
          >
            {t('reject')}
          </button>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            onClick={onToggleFeatured}
          >
            {gym.isFeatured ? t('unfeature') : t('feature')}
          </button>
          <button
            type="button"
            className="btn btn-primary !py-1.5 !px-3 text-xs"
            onClick={onActivate}
          >
            {t('plusMonth')}
          </button>
        </div>
      </div>
    </Reveal>
  );
}
