'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import { localizeText } from '../lib/localize';
import { Reveal } from './reveal';
import { SafeImage } from './safe-image';

export type TrainerCardData = {
  id: string;
  name: string;
  photoUrl: string | null;
  specialization: string | null;
  bio: string | null;
  gym: {
    id: string;
    slug: string;
    name: string;
    district: string | null;
    city: string;
  };
};

type TrainerCardProps = {
  trainer: TrainerCardData;
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

const SPEC_KEYS = ['strength', 'cardio_hiit', 'crossfit'] as const;

type DistrictKey = (typeof DISTRICT_KEYS)[number];
type SpecKey = (typeof SPEC_KEYS)[number];

function isDistrictKey(value: string): value is DistrictKey {
  return (DISTRICT_KEYS as readonly string[]).includes(value);
}

function isSpecKey(value: string): value is SpecKey {
  return (SPEC_KEYS as readonly string[]).includes(value);
}

export function TrainerCard({ trainer, index = 0 }: TrainerCardProps) {
  const t = useTranslations('trainersPage');
  const tCommon = useTranslations('common');
  const tSpecs = useTranslations('specializations');
  const tDistricts = useTranslations('districts');
  const locale = useLocale();

  const specializationLabel =
    trainer.specialization && isSpecKey(trainer.specialization)
      ? tSpecs(trainer.specialization)
      : trainer.specialization ?? tCommon('coach');

  const districtLabel = trainer.gym.district
    ? isDistrictKey(trainer.gym.district)
      ? tDistricts(trainer.gym.district)
      : trainer.gym.district
    : trainer.gym.city === 'Yerevan'
      ? tCommon('yerevan')
      : trainer.gym.city;

  return (
    <Reveal delay={Math.min(index * 0.06, 0.35)}>
      <article className="card-glass group overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          <SafeImage
            src={trainer.photoUrl}
            alt={trainer.name}
            fill
            className="object-cover object-[center_18%] transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
            <p className="eyebrow !normal-case !tracking-[0.08em]">
              {specializationLabel}
            </p>
            <h2 className="display text-2xl font-bold sm:text-3xl">
              {trainer.name}
            </h2>
            {trainer.bio ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-[rgba(244,241,236,0.78)]">
                {localizeText(trainer.bio, locale)}
              </p>
            ) : null}
            <div className="pt-2">
              <Link
                href={`/gyms/${trainer.gym.slug}`}
                className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-semibold text-[var(--accent)] transition hover:brightness-110"
              >
                <span>{trainer.gym.name}</span>
                <span className="text-[var(--muted)]">·</span>
                <span className="font-medium text-[var(--muted)]">
                  {districtLabel}
                </span>
                <span aria-hidden>→</span>
              </Link>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {t('atGym')}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
