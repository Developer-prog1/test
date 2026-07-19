'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import { Reveal } from './reveal';

export function SiteFooter() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <Reveal y={40} amount={0.15}>
      <footer className="mt-24 border-t border-[var(--line)] py-16 sm:py-20">
        <div className="container-shell grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <p className="display text-2xl font-bold sm:text-3xl">
              Gym<span className="text-[var(--accent)]">Hub</span>
            </p>
            <p className="max-w-md text-[var(--muted)]">{t('made')}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] md:justify-end md:pt-2">
            <Link href="/gyms">{nav('gyms')}</Link>
            <Link href="/trainers">{nav('trainers')}</Link>
            <Link href="/privacy">{nav('privacy')}</Link>
            <Link href="/terms">{nav('terms')}</Link>
            <Link href="/owner">{nav('owner')}</Link>
          </div>
        </div>
        <div className="container-shell mt-12 text-sm text-[var(--muted)]">
          {t('copy')}
        </div>
      </footer>
    </Reveal>
  );
}
