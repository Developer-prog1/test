# Նախագծի տեխնոլոգիական քարտ

> Լրացված է `docs/BRIEF.md`-ի և հաստատված stack-ի հիման վրա։

**Նախագիծ.** GymHub  
**Չափ.** C  
**Ամսաթիվ.** 2026-07-19  
**Ստատուս.** հաստատված (stack + մոդել). scaffold-ից առաջ env credentials դեռ պետք են

> Ստատուսներ. ⬜ չի սկսվել · 🔄 ընթացքում · ✅ պատրաստ · ➖ պետք չէ

---

## 1. Հիմք

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 1.1 | Նախագծի չափ | C | ✅ | Next.js + NestJS → monorepo |
| 1.2 | Ճարտարապետություն | Monorepo | ✅ | Turborepo |
| 1.3 | Package manager | pnpm | ✅ | ստանդարտ |
| 1.4 | Node.js | 24.x LTS | ✅ | |
| 1.5 | TypeScript | 5.9, strict: true | ✅ | |
| 1.6 | Monorepo գործիք | Turborepo | ✅ | |
| 1.7 | Git ստրատեգիա | feature branches | ✅ | |
| 1.8 | Commit կոնվենցիա | Conventional Commits | ✅ | |

---

## 2. Frontend

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 2.1 | Framework | Next.js 16.x (App Router, Turbopack) | ✅ | `apps/web` — **UI only** |
| 2.2 | Ոճեր | Tailwind CSS 4.x | ✅ | |
| 2.3 | UI Kit | shadcn/ui + custom | ✅ | + gallery UI · **dropdowns = `DarkSelect` միայն** (ADR-009) |
| 2.4 | State management | Zustand 5.x | ✅ | միայն client UI state |
| 2.5 | Ձևեր | React Hook Form + Zod | ✅ | UX only. server truth = Nest DTO |
| 2.6 | Data fetching | React Query 5.x → Nest REST | ✅ | **ոչ** Next Route Handlers բիզնեսի համար |
| 2.7 | i18n | next-intl (hy առաջին) | ✅ | en/ru հետո |
| 2.8 | SEO | Metadata API + JSON-LD | ✅ | տվյալները Nest-ից |
| 2.9 | Մուգ թեմա | պետք չէ (MVP) | ➖ | որոշել դիզայնից |
| 2.10 | Անիմացիաներ | CSS transitions + սահմանափակ Framer Motion | ✅ | գեղեցիկ UI |
| 2.11 | PWA | պետք չէ | ➖ | |
| 2.12 | Next API / Server Actions (բիզնես) | արգելված | ✅ | բոլոր լուրջ հարցերը → Nest |
| 2.13 | Responsive | **պարտադիր** (mobile-first) | ✅ | բոլոր UI փոփոխությունները միայն responsive |
| 2.14 | Dropdown / Select | `DarkSelect` | ✅ | `apps/web/src/shared/ui/dark-select.tsx` · native `<select>` արգելված է UI-ում |

---

## 3. Backend

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 3.1 | Տիպ | NestJS 11.x | ✅ | `apps/api` — **միակ backend** |
| 3.2 | Վալիդացիա | class-validator + class-transformer | ✅ | source of truth |
| 3.3 | API ձևաչափ | REST | ✅ | Swagger. միակ public API |
| 3.4 | Rate limiting | ThrottlerModule | ✅ | հայտերի spam պաշտպանություն |
| 3.5 | API փաստաթղթավորում | Swagger | ✅ | |
| 3.6 | CRON | @nestjs/schedule | ✅ | subscription expiry |
| 3.7 | Ֆայլերի բեռնում | Multer → Cloudflare R2 | ✅ | միայն Nest |
| 3.8 | Auth / RBAC / Payments / Email | Nest modules | ✅ | web-ում չկրկնել |

---

## 4. Բազային տվյալներ

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 4.1 | ՍՈՒԲԴ | PostgreSQL 17 (Neon) | ✅ | |
| 4.2 | ORM | Prisma 7.x | ✅ | `packages/database` — **միայն `apps/api` import** |
| 4.3 | ԲԴ դերեր | app_user + readonly_user | ✅ | |
| 4.4 | Connection limit | 10 (dev). prod՝ քննարկել | 🔄 | |
| 4.5 | statement_timeout | 15s | 🔄 | |
| 4.6 | idle_in_transaction_session_timeout | 10s | 🔄 | |
| 4.7 | lock_timeout | 5s | 🔄 | |
| 4.8 | Seed data | prisma db seed | ✅ | demo gyms, admin |
| 4.9 | Cache (Redis) | պետք չէ MVP | ➖ | հետո Upstash |
| 4.10 | Հերթեր | պետք չէ MVP | ➖ | email sync բավարար է |

---

## 5. Ինքնություն հաստատում

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 5.1 | Լուծում | NestJS Passport + JWT | ✅ | **ոչ** Auth.js/NextAuth web-ում |
| 5.2 | Մատակարարներ | Credentials (email/password) | ✅ | OAuth հետո |
| 5.3 | Սեսիաների ստրատեգիա | JWT (access + refresh) | ✅ | httpOnly cookies նախընտրելի |
| 5.4 | Դերեր / RBAC | USER, GYM_OWNER, ADMIN | ✅ | 3 role MVP |
| 5.5 | Email վերահաստատում | պետք է (P1) | 🔄 | MVP-ում կարող է պարզ լինել |
| 5.6 | Գաղտնաբառի վերականգնում | պետք է | ✅ | |

---

## 6. Պահոց և CDN

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 6.1 | Ֆայլային պահոց | Cloudflare R2 | ✅ | |
| 6.2 | CDN | Cloudflare | ✅ | |
| 6.3 | Պատկերների օպտիմիզացիա | next/image | ✅ | |

---

## 7. Արտաքին սերվիսներ

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 7.1 | Email / mailings | Resend | ✅ | lead + billing notices |
| 7.2 | Վճարումներ | Տեղական gateway (Ameria/Arca/IdRam) | 🔄 | միայն GYM→Platform subscription |
| 7.3 | Անալիտիկա | պետք չէ MVP | ➖ | |
| 7.4 | Error tracking | Sentry | ✅ | web + api |
| 7.5 | Որոնում | PostgreSQL filters (MVP) | ✅ | Meilisearch հետո |
| 7.6 | Push / WebSocket | պետք չէ | ➖ | |
| 7.7 | SMS | պետք չէ | ➖ | |
| 7.8 | AI սերվիսներ | պետք չէ | ➖ | |
| 7.9 | CMS | պետք չէ | ➖ | |
| 7.10 | Քարտեզներ | Google Maps կամ Mapbox | 🔄 | P1 |

---

## 8. DevOps և հոսթինգ

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 8.1 | Frontend հոսթինգ | Vercel | ✅ | `apps/web` |
| 8.2 | Backend հոսթինգ | Render / Fly.io | ✅ | `apps/api` |
| 8.3 | CI/CD | GitHub Actions | ✅ | |
| 8.4 | Docker | Dockerfile api-ի համար | ✅ | |
| 8.5 | WAF | Cloudflare | 🔄 | prod |
| 8.6 | Մոնիտորինգ | Sentry | ✅ | |
| 8.7 | Լոգավորում | Pino (api) | ✅ | |
| 8.8 | Շրջակա միջավայրեր | dev + prod | ✅ | staging հետո |
| 8.9 | Դոմեն | անհատական (հետո) | 🔄 | |
| 8.10 | ԲԴ բեքափներ | Neon auto (PITR) | ✅ | |

---

## 9. Թեստավորում

| # | Պարամետր | Որոշում | Ստատուս | Նշում |
|---|----------|---------|---------|-------|
| 9.1 | Unit թեստեր | Vitest | ✅ | |
| 9.2 | Կոմպոնենտային թեստեր | React Testing Library (կրիտիկական) | 🔄 | |
| 9.3 | E2E թեստեր | Playwright (կրիտիկական flows) | 🔄 | lead + subscription |
| 9.4 | Ծածկույթ (նպատակ) | ≥70% domain/services | 🔄 | |
| 9.5 | API թեստեր | supertest | ✅ | |

---

## 10. Անվտանգություն (պարտադիր)

| # | Պարամետր | Ստատուս | Նշում |
|---|----------|---------|-------|
| 10.1 | CORS | ✅ | միայն web origin |
| 10.2 | CSRF պաշտպանություն | ✅ | cookie-based auth |
| 10.3 | Helmet (NestJS) | ✅ | |
| 10.4 | Մուտքային տվյալների վալիդացիա | ✅ | |
| 10.5 | argon2 գաղտնաբառերի համար | ✅ | |
| 10.6 | Rate limiting | ✅ | հատկապես `/leads` |
| 10.7 | Env-փոփոխականներ (ոչ կոդում) | ✅ | |

---

## 11. Նախագծի փաստաթղթավորում

| # | Փաստաթուղթ | Ստատուս | Նշում |
|---|-------------|---------|-------|
| 11.1 | docs/BRIEF.md | ✅ | |
| 11.2 | docs/TECH_CARD.md | ✅ | այս ֆայլը |
| 11.3 | docs/01-ARCHITECTURE.md | ✅ | |
| 11.3b | docs/03-BOUNDARIES.md | ✅ | Next≠backend, Nest=server |
| 11.4 | docs/PROGRESS.md | ✅ | |
| 11.5 | Նախագծի README.md | ✅ | |
| 11.6 | .env.example | ✅ | |

---

## 12. Նախագծի եզրափակիչ ստուգում

> Լրացվում է զարգացման ավարտին։

### Կոդ և որակ

| # | Ստուգում | Ստատուս |
|---|----------|---------|
| 12.1–12.7 | Quality checks | ⬜ |

### Տվյալներ և անվտանգություն

| # | Ստուգում | Ստատուս |
|---|----------|---------|
| 12.8–12.12 | Data & security | ⬜ |

### Դեպլոյ

| # | Ստուգում | Ստատուս |
|---|----------|---------|
| 12.13–12.17 | Deploy | ⬜ |

### Փաստաթղթավորում

| # | Ստուգում | Ստատուս |
|---|----------|---------|
| 12.18–12.21 | Docs complete | 🔄 |

---

## Ամփոփում

**Հաստատված հիմք.** Size C monorepo. **Next.js = UI only**, **NestJS = բոլոր server/լուրջ հարցերը**. PostgreSQL/Prisma (api only), 3 roles, subscription billing (GYM→Platform), lead delivery, R2 media.  
**Քննարկել հետո.** վճարային gateway ընտրություն, քարտեզներ, email verify խստություն, staging env։

> **Հաջորդ փուլ.** monorepo scaffold (`apps/web`, `apps/api`, `packages/*`)՝ այս սահմանով։
