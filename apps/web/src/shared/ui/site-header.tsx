'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch, getAccessToken } from '../api/client';
import { Link, usePathname, useRouter } from '../../i18n/navigation';
import {
  AUTH_CHANGED_EVENT,
  initialsFromUser,
  logoutAuth,
  readAuthUser,
  writeAuthUser,
  type AuthUser,
} from '../lib/auth-session';
import { FAVORITES_CHANGED_EVENT, readFavoriteSlugs } from '../lib/favorites';
import { SafeImage } from './safe-image';

const locales = [
  { code: 'hy', label: 'Հայերեն', short: 'ՀԱՅ' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
] as const;

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M2.5 4.25L6 7.75L9.5 4.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.25 4.75h9.5a1.5 1.5 0 0 1 1.5 1.5v12.1a.75.75 0 0 1-1.18.62L12 15.35l-5.07 3.62a.75.75 0 0 1-1.18-.62V6.25a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.65" />
      <circle cx="12" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M6.2 18.35c1.2-2.15 3.2-3.35 5.8-3.35s4.6 1.2 5.8 3.35"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AccountAvatar({ user }: { user: AuthUser }) {
  if (user.avatarUrl) {
    return (
      <span className="relative h-full w-full overflow-hidden rounded-full">
        <SafeImage
          src={user.avatarUrl}
          alt={user.fullName ?? user.email}
          fill
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(214,255,62,0.18)] text-[11px] font-bold tracking-wide text-[var(--accent)]">
      {initialsFromUser(user)}
    </span>
  );
}

export function SiteHeader() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [savedCount, setSavedCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setLangOpen(false);
    setAccountOpen(false);
  }

  const current = locales.find((item) => item.code === locale) ?? locales[0];

  const links = [
    { href: '/', label: t('home') },
    { href: '/gyms', label: t('gyms') },
    { href: '/trainers', label: t('trainers') },
  ] as const;

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function syncCount() {
      setSavedCount(readFavoriteSlugs().length);
    }

    syncCount();
    window.addEventListener(FAVORITES_CHANGED_EVENT, syncCount);
    window.addEventListener('storage', syncCount);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, syncCount);
      window.removeEventListener('storage', syncCount);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncAuth() {
      if (!getAccessToken()) {
        if (!cancelled) setUser(null);
        return;
      }

      const cached = readAuthUser();
      if (cached && !cancelled) setUser(cached);

      try {
        const me = await apiFetch<AuthUser>('/auth/me');
        if (cancelled) return;
        writeAuthUser(me);
        setUser(me);
      } catch {
        if (cancelled) return;
        logoutAuth();
        setUser(null);
      }
    }

    void syncAuth();
    function onAuthChanged() {
      setUser(readAuthUser());
    }
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!langRef.current?.contains(target)) setLangOpen(false);
      if (!accountRef.current?.contains(target)) setAccountOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLangOpen(false);
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function handleLogout() {
    logoutAuth();
    setUser(null);
    setAccountOpen(false);
    router.push('/');
  }

  function accountHomePath(role: string): string {
    if (role === 'ADMIN') return '/admin';
    if (role === 'GYM_OWNER') return '/owner';
    return '/account';
  }

  function isOnAccountHome(role: string, path: string): boolean {
    if (role === 'ADMIN') return path === '/admin' || path.startsWith('/admin/');
    if (role === 'GYM_OWNER') {
      return path === '/owner' || path.startsWith('/owner/');
    }
    return path === '/account';
  }

  const onAccountHome = user ? isOnAccountHome(user.role, pathname) : false;

  function handleAccountClick() {
    if (!user) return;
    setLangOpen(false);
    if (!isOnAccountHome(user.role, pathname)) {
      setAccountOpen(false);
      router.push(accountHomePath(user.role));
      return;
    }
    setAccountOpen((value) => !value);
  }

  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');

  const shellClass = isAdminArea
    ? 'border-[rgba(244,241,236,0.12)] bg-[linear-gradient(135deg,rgba(34,38,48,0.98),rgba(24,27,34,0.99))] shadow-[0_16px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(214,255,62,0.04)]'
    : scrolled
      ? 'border-[rgba(214,255,62,0.22)] bg-[rgba(14,16,20,0.9)] shadow-[0_18px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(214,255,62,0.06)]'
      : 'border-[rgba(244,241,236,0.14)] bg-[rgba(18,20,26,0.42)] shadow-[0_16px_48px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]';

  const iconBtn = (active: boolean) =>
    active
      ? 'relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(214,255,62,0.16)] text-[var(--accent)] ring-1 ring-[rgba(214,255,62,0.4)] transition'
      : 'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--accent)]';

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[var(--header-height)] pt-3">
      <div className="container-shell pointer-events-auto">
        <div
          className={`relative flex h-14 items-center justify-between gap-3 rounded-full border px-3 backdrop-blur-2xl transition-[background,border-color,box-shadow] duration-300 sm:px-5 ${shellClass}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(214,255,62,0.45)] to-transparent opacity-70"
          />
          <Link
            href="/"
            className="display group inline-flex shrink-0 items-center gap-2 pl-1 text-xl font-bold tracking-tight"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(214,255,62,0.7)] transition group-hover:scale-110"
            />
            <span>
              Gym<span className="text-[var(--accent)]">Hub</span>
            </span>
          </Link>

          <nav className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? 'pointer-events-auto rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold !text-[#111] shadow-[0_6px_20px_rgba(214,255,62,0.25)]'
                      : 'pointer-events-auto rounded-full px-4 py-2 text-sm font-medium !text-[rgba(244,241,236,0.88)] transition hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--text)]'
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-20 flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/favorites"
              aria-label={t('favorites')}
              title={t('favorites')}
              className={iconBtn(pathname === '/favorites')}
            >
              <BookmarkIcon />
              {savedCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-none text-black">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              ) : null}
            </Link>

            <div className="relative" ref={langRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                onClick={() => {
                  setLangOpen((value) => !value);
                  setAccountOpen(false);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold tracking-[0.04em] text-[var(--text)] transition hover:bg-[rgba(255,255,255,0.06)]"
              >
                {current.short}
                <span className="text-[var(--muted)]">
                  <ChevronDown open={langOpen} />
                </span>
              </button>

              <AnimatePresence>
                {langOpen ? (
                  <motion.div
                    role="listbox"
                    aria-label={tCommon('language')}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, y: -6, scale: 0.98 }
                    }
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[11.5rem] origin-top-right overflow-hidden rounded-2xl border border-[rgba(244,241,236,0.1)] bg-[#14161c]/95 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                  >
                    {locales.map((item, index) => {
                      const active = locale === item.code;
                      return (
                        <motion.div
                          key={item.code}
                          initial={reduceMotion ? false : { opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: reduceMotion ? 0 : 0.04 + index * 0.05,
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <Link
                            href={pathname}
                            locale={item.code}
                            role="option"
                            aria-selected={active}
                            onClick={() => setLangOpen(false)}
                            className={
                              active
                                ? 'mx-1 flex items-center justify-between rounded-xl bg-[rgba(214,255,62,0.12)] px-3.5 py-2.5'
                                : 'mx-1 flex items-center justify-between rounded-xl px-3.5 py-2.5 transition duration-200 hover:bg-[rgba(255,255,255,0.05)]'
                            }
                          >
                            <span
                              className={
                                active
                                  ? 'text-[14px] font-semibold text-[var(--text)]'
                                  : 'text-[14px] font-medium text-[rgba(244,241,236,0.88)]'
                              }
                            >
                              {item.label}
                            </span>
                            <span
                              className={
                                active
                                  ? 'text-[11px] font-semibold tracking-[0.08em] text-[var(--accent)]'
                                  : 'text-[11px] font-medium tracking-[0.08em] text-[var(--muted)]'
                              }
                            >
                              {item.short}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-haspopup={onAccountHome ? 'menu' : undefined}
                  aria-expanded={onAccountHome ? accountOpen : undefined}
                  aria-label={t('account')}
                  title={user.fullName ?? user.email}
                  onClick={handleAccountClick}
                  className={
                    onAccountHome
                      ? 'group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-[rgba(214,255,62,0.85)] shadow-[0_0_18px_rgba(214,255,62,0.25)] transition duration-200 hover:scale-105 hover:ring-[var(--accent)] hover:shadow-[0_0_24px_rgba(214,255,62,0.4)] active:scale-95'
                      : 'group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-[rgba(214,255,62,0.5)] transition duration-200 hover:scale-105 hover:ring-[rgba(214,255,62,0.95)] hover:shadow-[0_0_20px_rgba(214,255,62,0.3)] active:scale-95'
                  }
                >
                  <AccountAvatar user={user} />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(214,255,62,0.12)] opacity-0 transition duration-200 group-hover:opacity-100"
                  />
                </button>

                <AnimatePresence>
                  {onAccountHome && accountOpen ? (
                    <motion.div
                      role="menu"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: -8, scale: 0.98 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, y: -6, scale: 0.98 }
                      }
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+0.65rem)] z-50 min-w-[11rem] origin-top-right overflow-hidden rounded-2xl border border-[rgba(244,241,236,0.1)] bg-[#14161c]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                    >
                      <p className="truncate px-3 py-2 text-xs text-[var(--muted)]">
                        {user.fullName ?? user.email}
                      </p>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold !text-[var(--text)] transition hover:bg-[rgba(255,255,255,0.05)] hover:!text-[var(--accent)]"
                      >
                        {t('logout')}
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label={t('login')}
                title={t('login')}
                className={
                  isAuthPage
                    ? 'relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(214,255,62,0.16)] text-[var(--accent)] ring-1 ring-[rgba(214,255,62,0.55)] shadow-[0_0_18px_rgba(214,255,62,0.2)] transition'
                    : 'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent)] ring-1 ring-[rgba(214,255,62,0.28)] transition hover:bg-[rgba(214,255,62,0.12)] hover:ring-[rgba(214,255,62,0.5)]'
                }
              >
                <UserIcon />
              </Link>
            )}
          </div>
        </div>

        <nav className="mt-2 flex justify-center gap-1 md:hidden">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? 'rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold !text-[#111]'
                    : 'rounded-full px-3.5 py-1.5 text-xs font-medium !text-[rgba(244,241,236,0.88)] ring-1 ring-[rgba(244,241,236,0.1)] backdrop-blur-md transition hover:!text-[var(--text)]'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
