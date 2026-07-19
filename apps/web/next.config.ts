import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

// Single source of truth: monorepo root `.env` (no apps/web/.env.local).
loadEnvConfig(path.join(__dirname, '../..'));

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-af91597b77174534b5dd4454db75184d.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  transpilePackages: ['@gymhub/shared'],
};

export default withNextIntl(nextConfig);
