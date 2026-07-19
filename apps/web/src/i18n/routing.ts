import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hy', 'en', 'ru'],
  defaultLocale: 'hy',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
