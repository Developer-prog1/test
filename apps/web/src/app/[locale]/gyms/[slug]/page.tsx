'use client';

import { FormEvent, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import {
  FAVORITES_CHANGED_EVENT,
  readFavoriteSlugs,
  toggleFavoriteSlug,
} from '../../../../shared/lib/favorites';
import { localizeText } from '../../../../shared/lib/localize';
import {
  isClosedHours,
  parseWorkingHours,
  WORKING_DAY_KEYS,
  type WorkingDayKey,
} from '../../../../shared/lib/working-hours';
import { AutoGrowTextarea } from '../../../../shared/ui/auto-grow-textarea';
import { SafeImage } from '../../../../shared/ui/safe-image';
import { Reveal } from '../../../../shared/ui/reveal';
import {
  PlanDetailModal,
  type PlanModalData,
} from '../../../../shared/ui/plan-detail-modal';

type GymDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string;
  district: string | null;
  phone: string | null;
  amenities: string[];
  verified: boolean;
  workingHours: unknown;
  media: { id: string; url: string; kind: string }[];
  trainers: {
    id: string;
    name: string;
    specialization: string | null;
    photoUrl: string | null;
    bio: string | null;
  }[];
  plans: {
    id: string;
    title: string;
    description: string | null;
    priceAmd: number;
    durationDays: number | null;
  }[];
};

const DAY_LABEL_KEYS: Record<WorkingDayKey, 'dayMon' | 'dayTue' | 'dayWed' | 'dayThu' | 'dayFri' | 'daySat' | 'daySun'> = {
  mon: 'dayMon',
  tue: 'dayTue',
  wed: 'dayWed',
  thu: 'dayThu',
  fri: 'dayFri',
  sat: 'daySat',
  sun: 'daySun',
};

export default function GymDetailPage() {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const tAmenities = useTranslations('amenities');
  const tDistricts = useTranslations('districts');
  const tSpecs = useTranslations('specializations');
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [wantsTrialDay, setWantsTrialDay] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanModalData | null>(null);
  const fav = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
      window.addEventListener('storage', onStoreChange);
      return () => {
        window.removeEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    () => readFavoriteSlugs().includes(slug),
    () => false,
  );

  const gym = useQuery({
    queryKey: ['gym', slug],
    queryFn: () => apiFetch<GymDetail>(`/gyms/${slug}`),
  });

  const lead = useMutation({
    mutationFn: () =>
      apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify({
          gymId: gym.data?.id,
          name,
          phone,
          note,
          wantsTrialDay,
          website: '',
        }),
      }),
    onSuccess: () => {
      setMessage(t('success'));
      setName('');
      setPhone('');
      setNote('');
    },
    onError: (error: unknown) => {
      setMessage(error instanceof ApiError ? error.message : tCommon('error'));
    },
  });

  if (gym.isLoading) {
    return <p className="container-shell py-20 text-[var(--muted)]">…</p>;
  }

  if (gym.isError || !gym.data) {
    return (
      <p className="container-shell py-20 text-[var(--accent-hot)]">{t('notFound')}</p>
    );
  }

  const data = gym.data;
  const hours = parseWorkingHours(data.workingHours);
  const highlightPlanIndex = Math.min(2, Math.max(0, data.plans.length - 1));
  const description = localizeText(data.description, locale);
  const districtLabel =
    data.district &&
    [
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
    ].includes(data.district)
      ? tDistricts(data.district as 'Kentron')
      : data.district;
  const amenityLabels = data.amenities.map((code) => {
    try {
      return tAmenities(code as 'parking');
    } catch {
      return code;
    }
  });
  const scheduleNote = hours?.note
    ? localizeText(hours.note, locale)
    : '';
  const localizedPlans = data.plans.map((plan) => ({
    ...plan,
    title: localizeText(plan.title, locale),
    description: plan.description
      ? localizeText(plan.description, locale)
      : null,
  }));
  const selectedLocalized = selectedPlan
    ? localizedPlans.find((plan) => plan.id === selectedPlan.id) ?? {
        ...selectedPlan,
        title: localizeText(selectedPlan.title, locale),
        description: selectedPlan.description
          ? localizeText(selectedPlan.description, locale)
          : null,
      }
    : null;

  return (
    <div>
      <section className="relative h-[58vh] min-h-[360px] overflow-hidden">
        <SafeImage
          src={data.media[0]?.url}
          alt={data.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-black/40 to-transparent" />
        <div className="container-shell relative z-10 flex h-full flex-col justify-end pb-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              {data.verified ? (
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase text-black">
                  {t('verified')}
                </span>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost !py-1.5 !px-3 text-xs"
                onClick={() => {
                  toggleFavoriteSlug(data.slug);
                }}
              >
                {fav ? t('saved') : t('save')}
              </button>
            </div>
            <h1 className="display mt-4 text-4xl font-bold sm:text-6xl">{data.name}</h1>
            <p className="mt-3 text-[var(--muted)]">
              {districtLabel} · {localizeText(data.address, locale)}
              {data.phone ? ` · ${data.phone}` : ''}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-shell space-y-16 py-12">
        <Reveal>
          <p className="max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
            {description}
          </p>
          <p className="mt-4 text-sm text-[var(--accent)]">
            {amenityLabels.join(' · ')}
          </p>
        </Reveal>

        {data.media.length > 1 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.media.slice(1).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <SafeImage
                    src={item.url}
                    alt=""
                    fill
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section>
            <Reveal>
              <h2 className="display text-3xl font-bold sm:text-4xl">{t('plans')}</h2>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {localizedPlans.map((plan, i) => {
                const featured = i === highlightPlanIndex;
                return (
                  <Reveal key={plan.id} delay={i * 0.06}>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={
                        featured
                          ? 'card-glass relative w-full overflow-hidden border-[rgba(214,255,62,0.35)] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.55)]'
                          : 'card-glass relative w-full p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]'
                      }
                    >
                      {featured ? (
                        <span className="absolute right-4 top-4 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                          {t('popular')}
                        </span>
                      ) : null}
                      <p className="text-sm font-medium text-[var(--muted)]">{plan.title}</p>
                      <p className="display mt-3 text-3xl font-bold sm:text-4xl">
                        {plan.priceAmd.toLocaleString()}
                        <span className="ml-1 text-base font-medium text-[var(--accent)]">
                          {tCommon('currency')}
                        </span>
                      </p>
                      {plan.description ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                          {plan.description}
                        </p>
                      ) : null}
                      {plan.durationDays ? (
                        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[rgba(214,255,62,0.7)]">
                          {plan.durationDays} {t('days')}
                        </p>
                      ) : null}
                      <p className="mt-4 text-xs font-medium text-[var(--accent)]">
                        {t('planOpen')}
                      </p>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {hours ? (
            <section>
              <Reveal>
                <h2 className="display text-3xl font-bold sm:text-4xl">{t('schedule')}</h2>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="card-glass mt-6 overflow-hidden">
                  <ul className="divide-y divide-[var(--line)]">
                    {WORKING_DAY_KEYS.map((day) => {
                      const value = hours[day];
                      const closed = isClosedHours(value);
                      return (
                        <li
                          key={day}
                          className="flex items-center justify-between gap-4 px-5 py-3.5"
                        >
                          <span className="text-sm text-[var(--muted)] sm:text-base">
                            {t(DAY_LABEL_KEYS[day])}
                          </span>
                          <span
                            className={
                              closed
                                ? 'text-sm font-semibold text-[var(--accent-hot)]'
                                : 'font-mono text-sm font-semibold tracking-wide text-[var(--text)] sm:text-base'
                            }
                          >
                            {closed ? t('closed') : value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {hours.note ? (
                    <p className="border-t border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)]">
                      <span className="text-[var(--accent)]">{t('scheduleNote')}: </span>
                      {scheduleNote}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            </section>
          ) : null}
        </div>

        <section>
          <Reveal>
            <h2 className="display text-3xl font-bold sm:text-4xl">{t('trainers')}</h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.trainers.map((trainer, i) => (
              <Reveal key={trainer.id} delay={i * 0.08}>
                <article className="card-glass group overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-[rgba(214,255,62,0.35)]">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
                    <SafeImage
                      src={trainer.photoUrl}
                      alt={trainer.name}
                      fill
                      className="object-cover object-[center_18%] transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                      <p className="eyebrow !normal-case !tracking-[0.08em]">
                        {trainer.specialization &&
                        ['strength', 'cardio_hiit', 'crossfit'].includes(
                          trainer.specialization,
                        )
                          ? tSpecs(
                              trainer.specialization as
                                | 'strength'
                                | 'cardio_hiit'
                                | 'crossfit',
                            )
                          : trainer.specialization ?? tCommon('coach')}
                      </p>
                      <h3 className="display text-2xl font-bold sm:text-3xl">
                        {trainer.name}
                      </h3>
                      {trainer.bio ? (
                        <p className="line-clamp-2 text-sm text-[var(--muted)]">
                          {localizeText(trainer.bio, locale)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <section className="card-glass max-w-xl p-6 md:p-8">
            <h2 className="display text-3xl font-bold">{t('leadTitle')}</h2>
            <p className="mt-2 text-[var(--muted)]">{t('leadText')}</p>
            <form
              className="mt-6 space-y-3"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                lead.mutate();
              }}
            >
              <input
                className="field"
                placeholder={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="field"
                placeholder={t('phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <AutoGrowTextarea
                placeholder={t('note')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                minRows={3}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={wantsTrialDay}
                  onChange={(e) => setWantsTrialDay(e.target.checked)}
                />
                {t('trial')}
              </label>
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <button type="submit" disabled={lead.isPending} className="btn btn-primary">
                {lead.isPending ? t('sending') : t('send')}
              </button>
              {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
            </form>
          </section>
        </Reveal>
      </div>

      <PlanDetailModal
        plan={selectedLocalized}
        gymName={data.name}
        open={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        currencyLabel={tCommon('currency')}
        labels={{
          title: t('planModalTitle'),
          close: t('planModalClose'),
          duration: t('planDuration'),
          days: t('days'),
          includes: t('planIncludes'),
          perkAccess: t('planPerkAccess'),
          perkSupport: t('planPerkSupport'),
          perkFlexible: t('planPerkFlexible'),
          cta: t('planModalCta'),
        }}
      />
    </div>
  );
}
