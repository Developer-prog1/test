import { clearTokens, getAccessToken } from '../api/client';

export const AUTH_CHANGED_EVENT = 'gymhub:auth-changed';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  avatarUrl: string | null;
};

const USER_KEY = 'gymhub_auth_user';

export function readAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  if (!getAccessToken()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function writeAuthUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function logoutAuth() {
  clearTokens();
  writeAuthUser(null);
}

export function initialsFromUser(user: Pick<AuthUser, 'fullName' | 'email'>): string {
  const source = user.fullName?.trim() || user.email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}
