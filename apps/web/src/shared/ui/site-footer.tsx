import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const nav = await getTranslations('nav');

  return (
    <footer className="mt-24 border-t border-[var(--line)] py-12">
      <div className="container-shell grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <p className="display text-2xl font-bold">
            Gym<span className="text-[var(--accent)]">Hub</span>
          </p>
          <p className="max-w-md text-[var(--muted)]">{t('made')}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] md:justify-end">
          <Link href="/gyms">{nav('gyms')}</Link>
          <Link href="/trainers">{nav('trainers')}</Link>
          <Link href="/privacy">{nav('privacy')}</Link>
          <Link href="/terms">{nav('terms')}</Link>
          <Link href="/owner">{nav('owner')}</Link>
        </div>
      </div>
      <div className="container-shell mt-8 text-sm text-[var(--muted)]">{t('copy')}</div>
    </footer>
  );
}
