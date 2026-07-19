# Տեխնոլոգիական stack. GymHub

**Վերջին թարմացում.** 2026-07-19  
**Աղբյուր.** `docs/TECH_CARD.md` · սահման՝ `docs/01-ARCHITECTURE.md`

---

## Պատասխանատվության բաժանում

| Շերտ | App | Պատասխանատվություն |
|------|-----|---------------------|
| Frontend | `apps/web` (Next.js) | Միայն UI / pages / SEO / API client |
| Backend | `apps/api` (NestJS) | Auth, DB, business, payments, email, files, cron |
| Data package | `packages/database` | Prisma — **import միայն api-ից** |
| Shared | `packages/shared` | enums / types / constants (ոչ services) |

---

## Workspace

| Գործիք | Տարբերակ / նշում |
|--------|------------------|
| pnpm | workspace |
| Turborepo | monorepo pipelines |
| Node.js | 24.x LTS |
| TypeScript | 5.9 strict · `any` արգելված է (ADR-010) |

---

## apps/web (Next.js) — UI only

| Կատեգորիա | Տեխնոլոգիա | Նշում |
|------------|------------|------|
| Framework | Next.js 16 (App Router) | ոչ բիզնես API routes |
| UI | React 19, Tailwind CSS 4, shadcn/ui | |
| Forms | React Hook Form + Zod | UX mirror. truth = Nest |
| Data | TanStack Query 5 | միայն Nest REST |
| i18n | next-intl (hy) | |
| Images | next/image | display. upload → Nest |

---

## apps/api (NestJS) — system of record

| Կատեգորիա | Տեխնոլոգիա |
|------------|------------|
| Framework | NestJS 11 |
| Validation | class-validator / class-transformer |
| Auth | Passport + JWT, argon2 |
| Docs | Swagger (միակ API) |
| Schedule | @nestjs/schedule |
| Logging | Pino |
| Security | Helmet, Throttler, CORS |
| ORM | Prisma 7 → PostgreSQL |
| Storage | R2 via Nest |
| Email | Resend via Nest |
| Payments | Gateway webhooks via Nest |

---

## Data & infra

| Կատեգորիա | Տեխնոլոգիա | Owner |
|------------|------------|-------|
| DB | PostgreSQL 17 (Neon) | Nest |
| ORM | Prisma 7 | Nest |
| Storage | Cloudflare R2 | Nest |
| Email | Resend | Nest |
| Payments | Local GW | Nest |
| Errors | Sentry | web + api |
| Hosting | Vercel (web) + Render/Fly (api) | |
| CI | GitHub Actions | |

---

## Չի մտնում MVP stack

- Redis / BullMQ
- Meilisearch
- WebSocket
- Mobile apps
- GraphQL
- Next.js API Routes / Server Actions բիզնեսի համար
- Auth.js / NextAuth որպես auth backend
