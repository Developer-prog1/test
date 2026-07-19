'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ApiError, apiFetch, getAccessToken, setTokens } from '../api/client';
import {
  writeAuthUser,
  type AuthUser,
} from '../lib/auth-session';
import { Link } from '../../i18n/navigation';
import { PasswordInput } from './password-input';
import { Reveal } from './reveal';

export type SettingsProfile = AuthUser & {
  phone: string | null;
  createdAt?: string;
};

type ProfileUpdateResponse = SettingsProfile & {
  accessToken?: string;
  refreshToken?: string;
};

function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName?.trim() ?? '';
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export function SettingsForm() {
  const t = useTranslations('settings');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ['auth-me'],
    enabled: Boolean(getAccessToken()),
    queryFn: () => apiFetch<SettingsProfile>('/auth/me'),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!me.data) return;
    const names = splitFullName(me.data.fullName);
    setFirstName(names.firstName);
    setLastName(names.lastName);
    setEmail(me.data.email);
    setPhone(me.data.phone ?? '');
  }, [me.data]);

  const saveProfile = useMutation({
    mutationFn: () =>
      apiFetch<ProfileUpdateResponse>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      }),
    onSuccess: (data) => {
      setProfileError(null);
      setProfileMessage(t('profileSaved'));
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      writeAuthUser({
        id: data.id,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
      });
      void qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err: unknown) => {
      setProfileMessage(null);
      setProfileError(
        err instanceof ApiError ? err.message : t('profileFailed'),
      );
    },
  });

  const savePassword = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: true }>('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }),
    onSuccess: () => {
      setPasswordError(null);
      setPasswordMessage(t('passwordSaved'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: unknown) => {
      setPasswordMessage(null);
      setPasswordError(
        err instanceof ApiError ? err.message : t('passwordFailed'),
      );
    },
  });

  function onProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    saveProfile.mutate();
  }

  function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError(tAuth('passwordMismatch'));
      return;
    }
    savePassword.mutate();
  }

  if (!getAccessToken()) {
    return (
      <p className="text-[var(--muted)]">
        {t('loginRequired')}{' '}
        <Link href="/login" className="font-semibold text-[var(--accent)]">
          {tNav('login')}
        </Link>
      </p>
    );
  }

  if (me.isLoading) {
    return <p className="text-[var(--muted)]">{t('loading')}</p>;
  }

  if (me.isError || !me.data) {
    return <p className="text-[var(--accent-hot)]">{tCommon('error')}</p>;
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="eyebrow mb-2">{t('eyebrow')}</p>
        <h1 className="display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{t('subtitle')}</p>
      </Reveal>

      <Reveal delay={0.06}>
        <form onSubmit={onProfileSubmit} className="card-glass space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="display text-xl font-semibold">{t('profileSection')}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{t('profileHint')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('firstName')}</span>
              <input
                className="field"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('lastName')}</span>
              <input
                className="field"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm text-[var(--muted)]">{t('email')}</span>
              <input
                type="email"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <span className="text-xs text-[var(--muted)]">{t('emailHint')}</span>
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm text-[var(--muted)]">{t('phone')}</span>
              <input
                className="field"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                required
                minLength={6}
              />
            </label>
          </div>
          {profileError ? (
            <p className="text-sm text-[var(--accent-hot)]">{profileError}</p>
          ) : null}
          {profileMessage ? (
            <p className="text-sm text-[var(--accent)]">{profileMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={saveProfile.isPending}
            className="btn btn-primary disabled:opacity-60"
          >
            {saveProfile.isPending ? t('saving') : t('saveProfile')}
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.1}>
        <form
          onSubmit={onPasswordSubmit}
          className="card-glass space-y-5 p-5 sm:p-6"
        >
          <div>
            <h2 className="display text-xl font-semibold">{t('passwordSection')}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{t('passwordHint')}</p>
          </div>
          <div className="grid max-w-xl gap-4">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">
                {t('currentPassword')}
              </span>
              <PasswordInput
                className="field"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
                revealLabel={tAuth('showPassword')}
                hideLabel={tAuth('hidePassword')}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">{t('newPassword')}</span>
              <PasswordInput
                className="field"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                revealLabel={tAuth('showPassword')}
                hideLabel={tAuth('hidePassword')}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">
                {t('confirmPassword')}
              </span>
              <PasswordInput
                className="field"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                revealLabel={tAuth('showPassword')}
                hideLabel={tAuth('hidePassword')}
              />
            </label>
          </div>
          {passwordError ? (
            <p className="text-sm text-[var(--accent-hot)]">{passwordError}</p>
          ) : null}
          {passwordMessage ? (
            <p className="text-sm text-[var(--accent)]">{passwordMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={savePassword.isPending}
            className="btn btn-ghost disabled:opacity-60"
          >
            {savePassword.isPending ? t('saving') : t('savePassword')}
          </button>
        </form>
      </Reveal>
    </div>
  );
}
