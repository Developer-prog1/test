'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch, setTokens } from '../../../shared/api/client';
import { writeAuthUser } from '../../../shared/lib/auth-session';
import { Link, useRouter } from '../../../i18n/navigation';
import { DarkSelect } from '../../../shared/ui/dark-select';
import { GoogleAuthButton } from '../../../shared/ui/google-auth-button';
import { PasswordInput } from '../../../shared/ui/password-input';
import { Reveal } from '../../../shared/ui/reveal';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'GYM_OWNER'>('USER');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

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
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone: phone.trim(),
          role,
        }),
      });
      setTokens(data.accessToken, data.refreshToken);
      writeAuthUser(data.user);
      router.push(data.user.role === 'GYM_OWNER' ? '/owner' : '/gyms');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('registerFailed'));
    }
  }

  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-16">
      <Reveal className="card-glass w-full max-w-md p-8">
        <h1 className="display text-4xl font-bold">{t('registerTitle')}</h1>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <input
            className="field"
            placeholder={t('firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
          <input
            className="field"
            placeholder={t('lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
          <input
            className="field"
            type="tel"
            placeholder={t('phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
          />
          <input
            className="field"
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <PasswordInput
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            revealLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
          />
          <PasswordInput
            placeholder={t('confirmPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            revealLabel={t('showPassword')}
            hideLabel={t('hidePassword')}
          />
          <DarkSelect
            name="role"
            aria-label={t('roleLabel')}
            className="w-full"
            value={role}
            onChange={(value) => setRole(value as 'USER' | 'GYM_OWNER')}
            options={[
              { value: 'USER', label: t('roleUser') },
              { value: 'GYM_OWNER', label: t('roleOwner') },
            ]}
          />
          <button type="submit" className="btn btn-primary w-full">
            {t('submitRegister')}
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
        {error ? <p className="mt-3 text-sm text-[var(--accent-hot)]">{error}</p> : null}
        <div className="mt-6 border-t border-[var(--line)] pt-5 text-center">
          <p className="text-sm text-[var(--muted)]">{t('hasAccount')}</p>
          <Link
            href="/login"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(214,255,62,0.4)] bg-[rgba(214,255,62,0.08)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:border-[rgba(214,255,62,0.65)] hover:bg-[rgba(214,255,62,0.16)]"
          >
            {t('submitLogin')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
