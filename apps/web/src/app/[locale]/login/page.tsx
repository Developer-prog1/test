'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch, setTokens } from '../../../shared/api/client';
import { writeAuthUser } from '../../../shared/lib/auth-session';
import { Link, useRouter } from '../../../i18n/navigation';
import { Reveal } from '../../../shared/ui/reveal';
import { PasswordInput } from '../../../shared/ui/password-input';
import { GoogleAuthButton } from '../../../shared/ui/google-auth-button';

const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    email: 'admin@gymhub.am',
    password: 'Admin123!',
    labelKey: 'demoAdmin' as const,
  },
  {
    id: 'reebok',
    email: 'reebok@gymhub.am',
    password: 'Owner123!',
    labelKey: 'demoReebokOwner' as const,
  },
  {
    id: 'user',
    email: 'user@gymhub.am',
    password: 'User12345!',
    labelKey: 'demoUser' as const,
  },
] as const;

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          email: string;
          role: string;
          fullName: string | null;
          avatarUrl: string | null;
        };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setTokens(data.accessToken, data.refreshToken);
      writeAuthUser(data.user);
      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'GYM_OWNER') router.push('/owner');
      else router.push('/gyms');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('loginFailed'));
    }
  }

  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-16">
      <Reveal className="card-glass w-full max-w-md p-8">
        <h1 className="display text-4xl font-bold">{t('loginTitle')}</h1>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {t('demoQuickFill')}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => fillDemo(account)}
                className="rounded-full border border-[rgba(244,241,236,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:border-[rgba(214,255,62,0.4)] hover:bg-[rgba(214,255,62,0.1)] hover:text-[var(--accent)]"
              >
                {t(account.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <input
            className="field"
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            revealLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
          />
          <button type="submit" className="btn btn-primary w-full">
            {t('submitLogin')}
          </button>
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[var(--line)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {t('or')}
            </span>
            <div className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <GoogleAuthButton />
        </form>
        {error ? (
          <p className="mt-3 text-sm text-[var(--accent-hot)]">{error}</p>
        ) : null}
        <div className="mt-6 border-t border-[var(--line)] pt-5 text-center">
          <p className="text-sm text-[var(--muted)]">{t('noAccount')}</p>
          <Link
            href="/register"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(214,255,62,0.4)] bg-[rgba(214,255,62,0.08)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:border-[rgba(214,255,62,0.65)] hover:bg-[rgba(214,255,62,0.16)]"
          >
            {t('submitRegister')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
