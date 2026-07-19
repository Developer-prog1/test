'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import {
  FAVORITES_CHANGED_EVENT,
  readFavoriteSlugs,
  toggleFavoriteSlug,
} from '../lib/favorites';
import { resolveGymStatus } from '../lib/gym-status';
import { CartNoticeModal } from './cart-notice-modal';
import { Reveal } from './reveal';
import { SafeImage } from './safe-image';

type GymCardProps = {
  gym: {
    id: string;
    slug: string;
    name: string;
    district: string | null;
    city: string;
    isFeatured: boolean;
    amenities?: string[];
    media: { url: string }[];
    plans: { priceAmd: number }[];
  };
  fromLabel: string;
  verifiedLabel: string;
  index?: number;
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

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.75 3.75h1.6l1.55 9.35a1.75 1.75 0 0 0 1.73 1.45h9.72a1.75 1.75 0 0 0 1.7-1.33l1.35-5.52a.9.9 0 0 0-.87-1.12H6.2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.15" cy="19.35" r="1.45" fill="currentColor" />
      <circle cx="17.1" cy="19.35" r="1.45" fill="currentColor" />
    </svg>
  );
}

export function GymCard({ gym, fromLabel, verifiedLabel, index = 0 }: GymCardProps) {
  const t = useTranslations('common');
  const tDetail = useTranslations('detail');
  const tCart = useTranslations('favoritesPage');
  const tStatus = useTranslations('gymStatus');
  const tDistricts = useTranslations('districts');
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<'added' | 'removed' | null>(null);

  const closeNotice = useCallback(() => setNotice(null), []);
  const status = resolveGymStatus(gym.amenities ?? [], gym.isFeatured);

  useEffect(() => {
    function sync() {
      setSaved(readFavoriteSlugs().includes(gym.slug));
    }

    sync();
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [gym.slug]);

  const districtLabel = gym.district
    ? isDistrictKey(gym.district)
      ? tDistricts(gym.district)
      : gym.district
    : gym.city === 'Yerevan'
      ? t('yerevan')
      : gym.city;

  return (
    <Reveal delay={Math.min(index * 0.08, 0.4)}>
      <article className="card-glass group relative transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]">
        <Link href={`/gyms/${gym.slug}`} className="block">
          <div className="relative aspect-[16/11] bg-[var(--surface)]">
            <div className="absolute inset-0 overflow-hidden">
              <SafeImage
                src={gym.media[0]?.url}
                alt={gym.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {status ? (
                <div
                  className="pointer-events-none absolute -left-10 top-5 z-[1] w-40 -rotate-45 bg-[var(--accent)] py-1.5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                  aria-hidden={false}
                >
                  <span className="block truncate px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-black sm:text-[10px]">
                    {tStatus(status)}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
              {gym.isFeatured ? (
                <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-black">
                  {t('featured')}
                </span>
              ) : null}
              <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] uppercase leading-none tracking-wide text-white">
                {verifiedLabel}
              </span>
            </div>
          </div>
          <div className="relative z-10 space-y-1 p-4 pr-14">
            <h3 className="display text-xl font-semibold">{gym.name}</h3>
            <p className="text-sm text-[var(--muted)]">
              {districtLabel}
              {gym.plans[0]
                ? ` · ${fromLabel} ${gym.plans[0].priceAmd.toLocaleString()} ${t('currency')}`
                : ''}
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label={saved ? tDetail('saved') : tDetail('save')}
          title={saved ? tDetail('saved') : tDetail('save')}
          onClick={() => {
            const next = toggleFavoriteSlug(gym.slug);
            setSaved(next);
            setNotice(next ? 'added' : 'removed');
          }}
          className={
            saved
              ? 'absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,255,62,0.45)] bg-[rgba(214,255,62,0.12)] text-[var(--accent)] transition hover:border-[rgba(214,255,62,0.7)]'
              : 'absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-black/45 text-[var(--text)] backdrop-blur transition hover:border-[rgba(214,255,62,0.4)] hover:text-[var(--accent)]'
          }
        >
          <CartIcon />
        </button>
      </article>

      <CartNoticeModal
        open={notice !== null}
        mode={notice ?? 'added'}
        onClose={closeNotice}
        labels={{
          added: tCart('addedToCart'),
          removed: tCart('removedFromCart'),
          viewCart: tCart('viewCart'),
          close: tCart('closeNotice'),
        }}
      />
    </Reveal>
  );
}
