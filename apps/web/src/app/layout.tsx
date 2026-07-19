import type { Metadata } from 'next';
import { Syne, Manrope, Noto_Sans_Armenian } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-armenian',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GymHub',
  description: 'Armenia gym directory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hy"
      className={`${syne.variable} ${manrope.variable} ${notoArmenian.variable}`}
      suppressHydrationWarning
    >
      <body
        style={
          {
            ['--font-display' as string]:
              'var(--font-syne), var(--font-armenian), sans-serif',
            ['--font-body' as string]:
              'var(--font-manrope), var(--font-armenian), sans-serif',
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
