'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/client';
import { Reveal } from '../../../shared/ui/reveal';
import {
  TrainerCard,
  type TrainerCardData,
} from '../../../shared/ui/trainer-card';

type TrainersResponse = {
  items: TrainerCardData[];
  total: number;
  page: number;
  pageSize: number;
};

export default function TrainersPage() {
  const t = useTranslations('trainersPage');
  const tCommon = useTranslations('common');

  const trainers = useQuery({
    queryKey: ['trainers'],
    queryFn: () => apiFetch<TrainersResponse>('/trainers?limit=100'),
  });

  const items = trainers.data?.items ?? [];

  return (
    <div className="container-shell py-12">
      <Reveal>
        <p className="eyebrow">{tCommon('yerevan')}</p>
        <h1 className="display mt-3 text-4xl font-bold sm:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          {trainers.isLoading
            ? t('loading')
            : t('subtitle', { count: trainers.data?.total ?? items.length })}
        </p>
      </Reveal>

      {trainers.isError ? (
        <p className="mt-10 text-[var(--accent-hot)]">{tCommon('error')}</p>
      ) : null}

      {!trainers.isLoading && items.length === 0 ? (
        <p className="mt-10 text-[var(--muted)]">{t('empty')}</p>
      ) : null}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((trainer, index) => (
          <TrainerCard key={trainer.id} trainer={trainer} index={index} />
        ))}
      </div>
    </div>
  );
}
