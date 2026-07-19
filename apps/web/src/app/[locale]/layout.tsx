import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '../../shared/providers';
import { SiteHeader } from '../../shared/ui/site-header';
import { SiteFooter } from '../../shared/ui/site-footer';
import { RoleAreaFooterGate } from '../../shared/ui/role-area-footer-gate';
import { LocaleHtmlLang } from '../../shared/ui/locale-html-lang';
import { routing } from '../../i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'hy' | 'en' | 'ru')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <LocaleHtmlLang />
        <SiteHeader />
        <main className="min-h-[calc(100vh-var(--header-height))] pt-[var(--header-height)]">
          {children}
        </main>
        <RoleAreaFooterGate>
          <SiteFooter />
        </RoleAreaFooterGate>
      </Providers>
    </NextIntlClientProvider>
  );
}
