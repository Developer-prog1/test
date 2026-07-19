'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import { Reveal } from './reveal';
import { SafeImage } from './safe-image';

export type AdminGymBoardItem = {
  id: string;
  name: string;
  city: string;
  district: string | null;
  moderationStatus: string;
  isFeatured: boolean;
  owner: { email: string; fullName?: string | null };
  media?: { url: string }[];
  plans?: { priceAmd: number }[];
};

const DISTRICT_KEYS = [
  'Kentron',
  'Arabkir',
  'Ajapnyak',
  'Avan',
  'Davtashen',
  'Erebuni',
  'Kanaker-Zeytun',
  'Malatia-Sebastia',
  'Nor Nork',
  'Nork-Marash',
  'Nubarashen',
  'Shengavit',
] as const;

type DistrictKey = (typeof DISTRICT_KEYS)[number];

function isDistrictKey(value: string): value is DistrictKey {
  return (DISTRICT_KEYS as readonly string[]).includes(value);
}

function moderationBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-[var(--accent)] text-black';
    case 'PENDING':
      return 'bg-[rgba(255,200,80,0.9)] text-black';
    case 'REJECTED':
      return 'bg-[var(--accent-hot)] text-white';
    default:
      return 'bg-white/20 text-white';
  }
}

type AdminGymBoardCardProps = {
  gym: AdminGymBoardItem;
  index: number;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
  onActivate: () => void;
};

export function AdminGymBoardCard({
  gym,
  index,
  onApprove,
  onReject,
  onToggleFeatured,
  onActivate,
}: AdminGymBoardCardProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tGyms = useTranslations('gyms');
  const tDistricts = useTranslations('districts');

  const districtLabel = gym.district
    ? isDistrictKey(gym.district)
      ? tDistricts(gym.district)
      : gym.district
    : gym.city === 'Yerevan'
      ? tCommon('yerevan')
      : gym.city;

  const statusLabel =
    gym.moderationStatus === 'APPROVED'
      ? t('statusApproved')
      : gym.moderationStatus === 'PENDING'
        ? t('statusPending')
        : gym.moderationStatus === 'REJECTED'
          ? t('statusRejected')
          : t('statusDraft');

  const price = gym.plans?.[0]?.priceAmd;

  return (
    <Reveal delay={Math.min(index * 0.06, 0.35)}>
      <article className="card-glass group relative flex h-full flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]">
        <Link href={`/admin/gyms/${gym.id}`} className="block">
          <div className="relative aspect-[16/11] bg-[var(--surface)]">
            <div className="absolute inset-0 overflow-hidden">
              <SafeImage
                src={gym.media?.[0]?.url}
                alt={gym.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2">
              {gym.isFeatured ? (
                <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-black">
                  {tCommon('featured')}
                </span>
              ) : null}
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide ${moderationBadgeClass(gym.moderationStatus)}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="space-y-1 p-4">
            <h3 className="display text-xl font-semibold">{gym.name}</h3>
            <p className="text-sm text-[var(--muted)]">
              {districtLabel}
              {price != null
                ? ` · ${tGyms('from')} ${price.toLocaleString()} ${tCommon('currency')}`
                : ''}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {gym.owner.fullName
                ? `${gym.owner.fullName} · ${gym.owner.email}`
                : gym.owner.email}
            </p>
          </div>
        </Link>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--line)] p-3">
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
      </article>
    </Reveal>
  );
}
