'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiFetch } from '../../shared/api/client';
import { Link } from '../../i18n/navigation';
import { Reveal } from '../../shared/ui/reveal';
import { GymCard } from '../../shared/ui/gym-card';
import { SafeImage } from '../../shared/ui/safe-image';

type FeaturedItem = {
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

const HERO =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';
const BANNER =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80';

const MARQUEE_KEYS = [
  'marqueeStrength',
  'marqueeCrossfit',
  'marqueeYoga',
  'marqueeBoxing',
  'marqueePilates',
  'marqueeHiit',
  'marqueeRecovery',
  'marqueeCardio',
] as const;

export default function HomePage() {
  const t = useTranslations('home');
  const g = useTranslations('gyms');

  const featured = useQuery({
    queryKey: ['featured'],
    queryFn: () => apiFetch<FeaturedItem[]>('/gyms/featured/weekly'),
  });

  const titleLines = t('title').split('\n');

  return (
    <div>
      <section className="relative min-h-[92vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="hero-drift absolute inset-[-12%]">
            <SafeImage
              src={HERO}
              alt=""
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="hero-grid" />
        <div className="container-shell relative z-10 flex min-h-[92vh] flex-col justify-end pb-16 pt-28">
          <motion.p
            className="eyebrow mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('eyebrow')}
          </motion.p>
          <motion.h1
            className="display max-w-4xl text-5xl font-bold sm:text-7xl md:text-8xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-xl text-lg text-[var(--muted)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            {t('subtitle')}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <Link href="/gyms" className="btn btn-primary">
              {t('ctaPrimary')}
            </Link>
            <a href="#how" className="btn btn-ghost">
              {t('ctaSecondary')}
            </a>
          </motion.div>
          <motion.div
            className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-[var(--line)] pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <p className="display text-3xl font-bold text-[var(--accent)]">15+</p>
              <p className="text-sm text-[var(--muted)]">{t('statsGyms')}</p>
            </div>
            <div>
              <p className="display text-3xl font-bold">100%</p>
              <p className="text-sm text-[var(--muted)]">{t('statsVerified')}</p>
            </div>
            <div>
              <p className="display text-3xl font-bold">1</p>
              <p className="text-sm text-[var(--muted)]">{t('statsCity')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-[var(--line)] bg-[var(--bg-elevated)] py-4">
        <div className="marquee text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
          {[...MARQUEE_KEYS, ...MARQUEE_KEYS].map((key, i) => (
            <span key={`${key}-${i}`} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {t(key)}
            </span>
          ))}
        </div>
      </div>

      <section className="container-shell py-24">
        <Reveal>
          <p className="eyebrow">{t('picksTitle')}</p>
          <h2 className="display mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            {t('picksTitle')}
          </h2>
          <p className="mt-3 max-w-xl text-[var(--muted)]">{t('picksSubtitle')}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(featured.data ?? []).map((gym, index) => (
            <GymCard
              key={gym.id}
              gym={gym}
              index={index}
              fromLabel={g('from')}
              verifiedLabel={g('verified')}
            />
          ))}
        </div>
      </section>

      <section id="how" className="container-shell pb-24">
        <Reveal>
          <h2 className="display text-4xl font-bold sm:text-5xl">{t('howTitle')}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { title: t('how1Title'), text: t('how1Text'), n: '01' },
            { title: t('how2Title'), text: t('how2Text'), n: '02' },
            { title: t('how3Title'), text: t('how3Text'), n: '03' },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 0.12}>
              <article className="card-glass relative min-h-[220px] p-6">
                <span className="display text-5xl font-bold text-[rgba(214,255,62,0.25)]">
                  {step.n}
                </span>
                <h3 className="display mt-4 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-[var(--muted)]">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-shell pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)]">
            <div className="absolute inset-0">
              <SafeImage src={BANNER} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
            </div>
            <div className="relative grid gap-8 p-8 md:grid-cols-[1.2fr_auto] md:items-end md:p-14">
              <div>
                <p className="eyebrow">{t('bannerTitle')}</p>
                <h2 className="display mt-3 max-w-xl text-4xl font-bold sm:text-5xl">
                  {t('bannerTitle')}
                </h2>
                <p className="mt-4 max-w-lg text-[var(--muted)]">{t('bannerText')}</p>
              </div>
              <Link href="/register" className="btn btn-primary self-start md:self-end">
                {t('bannerCta')}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
