'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ApiError, apiFetch } from '../../../../shared/api/client';
import { Link } from '../../../../i18n/navigation';
import { Reveal } from '../../../../shared/ui/reveal';

type ListingPackage = {
  id: string;
  months: number;
  priceAmd: number;
  popular: boolean;
};

type SubscriptionPayload = {
  gymId: string;
  priceAmd: number;
  packages: ListingPackage[];
  subscription: {
    status: string;
    startsAt: string;
    endsAt: string;
    priceAmd: number;
  } | null;
};

function subscriptionLabel(
  status: string | undefined,
  t: ReturnType<typeof useTranslations<'owner'>>,
): string {
  switch (status) {
    case 'ACTIVE':
      return t('statusActive');
    case 'EXPIRED':
      return t('statusExpired');
    case 'CANCELED':
      return t('statusCanceled');
    default:
      return t('none');
  }
}

function formatAmd(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'hy' ? 'hy-AM' : locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

function monthlyRate(pack: ListingPackage): number {
  return Math.round(pack.priceAmd / pack.months);
}

export default function OwnerPackagesPage() {
  const t = useTranslations('owner');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const qc = useQueryClient();

  const subscription = useQuery({
    queryKey: ['owner-sub'],
    queryFn: () => apiFetch<SubscriptionPayload>('/owner/subscription'),
  });

  const checkout = useMutation({
    mutationFn: (packageId: string) =>
      apiFetch('/owner/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ packageId }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['owner-sub'] });
      void qc.invalidateQueries({ queryKey: ['owner-gym'] });
    },
  });

  if (subscription.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  if (subscription.isLoading || !subscription.data) {
    return <p className="text-[var(--muted)]">{t('loadingPackages')}</p>;
  }

  const current = subscription.data.subscription;
  const packages = subscription.data.packages;
  const checkoutError =
    checkout.error instanceof ApiError
      ? checkout.error.message
      : checkout.isError
        ? t('packageCheckoutFailed')
        : null;

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="display text-4xl font-bold">{t('packagesTitle')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {t('packagesSubtitle')}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5 sm:p-6">
          <p className="text-sm text-[var(--muted)]">{t('currentListing')}</p>
          <p className="mt-1 text-lg font-semibold">
            {subscriptionLabel(current?.status, t)}
            {current?.endsAt
              ? ` · ${t('validUntil', {
                  date: new Date(current.endsAt).toLocaleDateString(locale),
                })}`
              : ''}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t('packagesHint')}
          </p>
        </section>
      </Reveal>

      {checkoutError ? (
        <p className="text-sm text-[var(--accent-hot)]">{checkoutError}</p>
      ) : null}

      {checkout.isSuccess ? (
        <p className="text-sm text-[var(--accent)]">{t('packageCheckoutSuccess')}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((pack, index) => {
          const perMonth = monthlyRate(pack);
          const isBusy =
            checkout.isPending && checkout.variables === pack.id;

          return (
            <Reveal key={pack.id} delay={0.08 + index * 0.04}>
              <article
                className={
                  pack.popular
                    ? 'relative flex h-full flex-col rounded-[1.5rem] border border-[rgba(214,255,62,0.45)] bg-[rgba(214,255,62,0.06)] p-5'
                    : 'relative flex h-full flex-col rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5'
                }
              >
                {pack.popular ? (
                  <span className="absolute -top-3 left-4 rounded-full border border-[rgba(214,255,62,0.45)] bg-[#12141a] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                    {t('packagePopular')}
                  </span>
                ) : null}

                <p className="text-sm text-[var(--muted)]">
                  {t('packageDuration', { months: pack.months })}
                </p>
                <p className="display mt-3 text-3xl font-bold">
                  {formatAmd(pack.priceAmd, locale)}
                  <span className="ml-1 text-base font-medium text-[var(--muted)]">
                    {tCommon('currency')}
                  </span>
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t('packagePerMonth', {
                    price: formatAmd(perMonth, locale),
                    currency: tCommon('currency'),
                  })}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[rgba(244,241,236,0.84)]">
                  <li>{t('packageBenefitListing')}</li>
                  <li>{t('packageBenefitLeads')}</li>
                  <li>{t('packageBenefitExtend')}</li>
                </ul>
                <button
                  type="button"
                  className={
                    pack.popular
                      ? 'btn btn-primary mt-auto w-full disabled:opacity-60'
                      : 'btn btn-ghost mt-auto w-full disabled:opacity-60'
                  }
                  disabled={checkout.isPending}
                  onClick={() => checkout.mutate(pack.id)}
                >
                  {isBusy ? t('processingPayment') : t('choosePackage')}
                </button>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
