import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../../shared/ui/reveal';

export default async function TermsPage() {
  const t = await getTranslations('legal');

  return (
    <div className="container-shell max-w-2xl py-16">
      <Reveal>
        <h1 className="display text-4xl font-bold">{t('termsTitle')}</h1>
        <p className="mt-6 leading-relaxed text-[var(--muted)]">{t('termsBody')}</p>
      </Reveal>
    </div>
  );
}
