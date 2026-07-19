'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch } from '../../../shared/api/client';
import { formatDate } from '../../../shared/lib/format-date';
import { localizeText } from '../../../shared/lib/localize';
import { Link } from '../../../i18n/navigation';
import { Reveal } from '../../../shared/ui/reveal';

function moderationLabel(
  status: string | undefined,
  t: ReturnType<typeof useTranslations<'owner'>>,
): string {
  switch (status) {
    case 'APPROVED':
      return t('statusApproved');
    case 'PENDING':
      return t('statusPending');
    case 'REJECTED':
      return t('statusRejected');
    default:
      return status ?? '';
  }
}

function leadStatusLabel(
  status: string,
  t: ReturnType<typeof useTranslations<'owner'>>,
): string {
  switch (status) {
    case 'NEW':
      return t('statusNew');
    case 'READ':
      return t('statusRead');
    default:
      return status;
  }
}

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

export default function OwnerPage() {
  const t = useTranslations('owner');
  const locale = useLocale();
  const qc = useQueryClient();
  const gym = useQuery({
    queryKey: ['owner-gym'],
    queryFn: () => apiFetch<Record<string, unknown>>('/owner/gym'),
  });
  const leads = useQuery({
    queryKey: ['owner-leads'],
    queryFn: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          phone: string;
          status: string;
          wantsTrialDay: boolean;
          note: string | null;
        }>
      >('/owner/leads'),
  });
  const subscription = useQuery({
    queryKey: ['owner-sub'],
    queryFn: () =>
      apiFetch<{
        subscription: { status: string; endsAt: string } | null;
        priceAmd: number;
      }>('/owner/subscription'),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/owner/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'READ' }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['owner-leads'] }),
  });

  if (gym.isError) {
    return (
      <p className="text-[var(--accent-hot)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="text-[var(--accent)]">
          {t('login')}
        </Link>
      </p>
    );
  }

  const data = gym.data as
    | {
        name?: string;
        completenessScore?: number;
        moderationStatus?: string;
        stats?: { viewCount: number; newLeadsWeek: number; newLeadsToday: number };
      }
    | undefined;

  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="display text-4xl font-bold">{t('title')}</h1>
      </Reveal>

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              {
                label: t('gym'),
                value: data.name,
                sub: moderationLabel(data.moderationStatus, t),
              },
              { label: t('completeness'), value: `${data.completenessScore}%` },
              { label: t('views'), value: data.stats?.viewCount ?? 0 },
              { label: t('leadsWeek'), value: data.stats?.newLeadsWeek ?? 0 },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 0.06}>
                <div className="card-glass p-5">
                  <p className="text-sm text-[var(--muted)]">{card.label}</p>
                  <p className="display mt-2 text-2xl font-bold">{card.value}</p>
                  {card.sub ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">{card.sub}</p>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <Link href="/owner/gym" className="btn btn-primary inline-flex">
              {t('navGym')}
            </Link>
          </Reveal>
        </>
      ) : null}

      <Reveal>
        <section className="card-glass space-y-3 p-6">
          <h2 className="display text-2xl font-semibold">{t('subscription')}</h2>
          <p className="text-sm text-[var(--muted)]">
            {subscriptionLabel(subscription.data?.subscription?.status, t)}
            {subscription.data?.subscription?.endsAt
              ? ` · ${formatDate(subscription.data.subscription.endsAt)}`
              : ''}
          </p>
          <Link href="/owner/packages" className="btn btn-primary inline-flex">
            {t('payRenew')}
          </Link>
        </section>
      </Reveal>

      <section className="space-y-3">
        <Reveal>
          <h2 className="display text-2xl font-semibold">{t('leadsInbox')}</h2>
        </Reveal>
        {(leads.data ?? []).map((lead, i) => (
          <Reveal key={lead.id} delay={i * 0.04}>
            <div className="card-glass flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {lead.name} · {lead.phone}
                  {lead.wantsTrialDay ? ` · ${t('trial')}` : ''}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {leadStatusLabel(lead.status, t)}
                  {lead.note
                    ? ` · ${localizeText(lead.note, locale)}`
                    : ''}
                </p>
              </div>
              {lead.status === 'NEW' ? (
                <button
                  type="button"
                  className="text-sm text-[var(--accent)]"
                  onClick={() => markRead.mutate(lead.id)}
                >
                  {t('markRead')}
                </button>
              ) : null}
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
