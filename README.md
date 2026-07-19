# GymHub

Հայաստանի GYM-երի վճարովի տեղեկատու և lead պլատֆորմ։

- **GYM owner**-ը վճարում է ամսական listing fee
- **User**-ը գտնում է GYM և թողնում է հայտ
- Stack. **Next.js** (`apps/web`, UI only) + **NestJS** (`apps/api`, բոլոր server հարցերը)

---

## Frontend / Backend սահման

| Next.js | NestJS |
|---------|--------|
| UI, pages, SEO, forms UX | Auth, RBAC, validation (truth) |
| Nest API client | DB/Prisma, leads, subscriptions |
| | Payments, R2, email, cron, webhooks |

Մանրամասն՝ [docs/03-BOUNDARIES.md](docs/03-BOUNDARIES.md)

---

## Մեկնարկ

Երկու process՝ **առանձին terminal**-ներում (միասին մեկ հրամանով չեն run լինում)։ Իրար հետ աշխատում են HTTP-ով (`NEXT_PUBLIC_API_URL` → Nest)։

```bash
pnpm install
pnpm db:push
```

**Terminal 1 — API (NestJS)**

```bash
pnpm dev:api
```

→ http://localhost:4000/api/v1  
→ Health: http://localhost:4000/api/v1/health

**Terminal 2 — Web (Next.js)**

```bash
pnpm dev:web
```

→ http://localhost:3000

| App | Հրաման | URL |
|-----|--------|-----|
| API | `pnpm dev:api` | http://localhost:4000/api/v1 |
| Web | `pnpm dev:web` | http://localhost:3000 |

---

## Կառուցվածք

```text
apps/web          Next.js 16 (UI)
apps/api          NestJS 11 (API)
packages/database Prisma + Neon
packages/shared   shared enums/types
```

---

## Roles (MVP)

| Role | Կոդ |
|------|-----|
| User | `USER` |
| Gym owner | `GYM_OWNER` |
| Admin | `ADMIN` |

---

## Փաստաթղթեր

| Ֆայլ | Նշանակություն |
|------|----------------|
| [docs/BRIEF.md](docs/BRIEF.md) | Արտադրանք |
| [docs/TECH_CARD.md](docs/TECH_CARD.md) | Tech որոշումներ |
| [docs/01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md) | Ճարտարապետություն |
| [docs/03-BOUNDARIES.md](docs/03-BOUNDARIES.md) | Next≠backend |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Առաջընթաց |

---

## Env

- Root `.env` — **մեկ ֆայլ** ամբողջ monorepo-ի համար (API, web, Prisma) — **gitignored**
- `.env.example` — օրինակ առանց գաղտնիքների
- `apps/web/.env.local` **չօգտագործել**

---

[MIT](LICENSE)
