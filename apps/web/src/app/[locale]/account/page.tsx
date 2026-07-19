'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, getAccessToken } from '../../../shared/api/client';
import { Link } from '../../../i18n/navigation';
import {
  initialsFromUser,
  type AuthUser,
} from '../../../shared/lib/auth-session';
import { Reveal } from '../../../shared/ui/reveal';
import { SafeImage } from '../../../shared/ui/safe-image';

function roleLabel(
  role: string,
  t: ReturnType<typeof useTranslations<'accountPage'>>,
): string {
  switch (role) {
    case 'ADMIN':
      return t('roleAdmin');
    case 'GYM_OWNER':
      return t('roleOwner');
    default:
      return t('roleUser');
  }
}

export default function AccountPage() {
  const t = useTranslations('accountPage');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const me = useQuery({
    queryKey: ['auth-me'],
    enabled: Boolean(getAccessToken()),
    queryFn: () => apiFetch<AuthUser>('/auth/me'),
  });

  if (!getAccessToken()) {
    return (
      <div className="container-shell py-12">
        <p className="text-[var(--muted)]">
          {t('loginRequired')}{' '}
          <Link href="/login" className="font-semibold text-[var(--accent)]">
            {tNav('login')}
          </Link>
        </p>
      </div>
    );
  }

  if (me.isLoading) {
    return (
      <div className="container-shell py-12">
        <p className="text-[var(--muted)]">{t('loading')}</p>
      </div>
    );
  }

  if (me.isError || !me.data) {
    return (
      <div className="container-shell py-12">
        <p className="text-[var(--accent-hot)]">{tCommon('error')}</p>
      </div>
    );
  }

  const user = me.data;

  return (
    <div className="container-shell py-12">
      <Reveal>
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="display mt-3 text-4xl font-bold sm:text-5xl">
          {t('title')}
        </h1>
      </Reveal>

      <Reveal delay={0.08}>
        <article className="card-glass mt-10 max-w-xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <span className="relative h-16 w-16 overflow-hidden rounded-full ring-1 ring-[rgba(214,255,62,0.4)]">
                <SafeImage
                  src={user.avatarUrl}
                  alt={user.fullName ?? user.email}
                  fill
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(214,255,62,0.16)] text-lg font-bold text-[var(--accent)] ring-1 ring-[rgba(214,255,62,0.35)]">
                {initialsFromUser(user)}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="display truncate text-2xl font-bold">
                {user.fullName ?? user.email}
              </h2>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">
                {user.email}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {roleLabel(user.role, t)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {user.role === 'ADMIN' ? (
              <Link href="/admin" className="btn btn-primary">
                {t('goAdmin')}
              </Link>
            ) : null}
            {user.role === 'GYM_OWNER' ? (
              <Link href="/owner" className="btn btn-primary">
                {t('goOwner')}
              </Link>
            ) : null}
            <Link href="/favorites" className="btn btn-ghost">
              {tNav('favorites')}
            </Link>
          </div>
        </article>
      </Reveal>
    </div>
  );
}
