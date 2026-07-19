# Նախագծի ճարտարապետություն. GymHub

> Հայաստանի GYM-երի վճարովի տեղեկատու և lead պլատֆորմ։ GYM-ը վճարում է ամսական listing-ի համար. user-ը թողնում է հայտ. պլատֆորմը չի մասնակցում վաճառքին։

**Նախագծի չափ.** C  
**Վերջին թարմացում.** 2026-07-19

---

## Պարտադիր սահման. Frontend vs Backend

> **Մաքուր բաժանում.** Next.js = միայն frontend։ NestJS = բոլոր լուրջ/server հարցերը։

| Պատասխանատու | Անում է | Չի անում |
|--------------|---------|----------|
| **`apps/web` (Next.js)** | UI, էջեր, routing, SEO metadata, i18n UI, forms UX, `next/image`, Nest API-ի կանչեր | DB, Prisma, business logic, auth issuance, payments, email, R2 բիզնես, cron, webhooks, RBAC enforcement |
| **`apps/api` (NestJS)** | REST API, auth/JWT, RBAC, validation (source of truth), Prisma/DB, leads, subscriptions, payments, R2 upload, email, cron, Swagger, rate limit | UI rendering, page routing |

### Կոշտ կանոններ

1. **Չկան Next.js Route Handlers / `app/api/**` բիզնես endpoint-ներ** — բոլոր API-ները միայն Nest-ում։
2. **Web-ը երբեք չի միանում DB-ին** — Prisma client-ը օգտագործում է միայն `apps/api` (via `packages/database`)։
3. **Auth.** login/register/refresh/password — միայն Nest։ Web-ը պահում/ուղարկում է token/cookie և կանչում է API։
4. **Վալիդացիա.** Nest DTO = պարտադիր source of truth։ Web Zod = միայն UX (optional mirror)։
5. **Ֆայլեր, վճարումներ, email, cron, webhooks** — միայն Nest։
6. **Shared packages** (`packages/shared`) — միայն types/enums/constants, ոչ business services։
7. **RSC/SSR թույլատրվում է**, բայց միայն Nest HTTP կանչերով — **ոչ** Prisma, **ոչ** business side-effects։
8. **Ամբողջ արգելվածների ցանկ.** տե՛ս [`docs/03-BOUNDARIES.md`](./03-BOUNDARIES.md)։

> Եթե կասկած կա «սա backend է, թե UI» — պատասխանը Nest է։

---

## Ամբողջակ

### Նշանակություն

GymHub-ը ցուցադրում է GYM պրոֆիլներ (նկարներ, հասցե, rating, trainers, փաթեթներ) և փոխանցում է օգտատիրոջ հայտերը համապատասխան GYM-ի տիրոջը։ Եկամուտը՝ GYM subscription։

### Հիմնական առանձնահատկություններ

- Public կատալոգ + SEO-friendly GYM էջեր
- Lead ձև → GYM inbox (+ email ծանուցում)
- Gym owner portal (պրոֆիլ, մեդիա, հայտեր, subscription)
- Admin մոդերացիա և approve
- Listing տեսանելի է միայն `subscription.active` + `moderation.approved`

### Օգտատերեր (RBAC)

| Դեր | Կոդ | Ինչ է անում |
|-----|-----|-------------|
| User | `USER` | Դիտում, հայտ թողնում (guest հայտը թույլատրվում է) |
| Gym owner | `GYM_OWNER` | Պրոֆիլ, մեդիա, հայտեր, subscription վճարում |
| Admin | `ADMIN` | Approve, մոդերացիա, subscription override |

> Առանձին `MANAGER` role MVP-ում չկա — owner-ը ծածկում է manager աշխատանքը։

---

## Ճարտարապետություն

### Բարձր մակարդակի դիագրամ

```
┌──────────────────┐     REST/JSON      ┌──────────────────┐
│   apps/web       │ ─────────────────▶ │   apps/api       │
│   Next.js 16     │                    │   NestJS 11      │
│   (Vercel)       │                    │   (Render/Fly)   │
└──────────────────┘                    └────────┬─────────┘
                                                 │
                    ┌──────────────┬─────────────┼─────────────┐
                    ▼              ▼             ▼             ▼
              PostgreSQL      Cloudflare R2   Resend    Payment GW
              (Prisma)         (media)        (email)   (subscription)
```

### Ճարտարապետական ոճ

**Modular monolith (API) + separate web app** monorepo-ում։

**Հիմնավորում.** Առանձին NestJS API պահանջված է. monorepo-ն կիսում է types/contracts. Միկրոսերվիսներ չեն պետք MVP-ում։

---

## Համակարգի կոմպոնենտներ

### Frontend (`apps/web`) — UI only

- Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui
- Public / gym-owner / admin **էկրաններ** (ոչ business API)
- Data. TanStack Query → `NEXT_PUBLIC_API_URL` (Nest)
- Auth UX. login forms. session storage ըստ Nest պատասխանի
- SEO. Metadata + JSON-LD (տվյալները Nest-ից)

### Backend (`apps/api`) — system of record

- NestJS modules. auth, users, gyms, media, leads, subscriptions, admin, payments
- REST + Swagger (միակ API մակերեսը)
- Prisma → PostgreSQL (`packages/database` — **միայն api-ն է import անում**)
- R2 uploads, Resend email, payment webhooks, cron

### Shared packages

| Package | Նշանակություն | Ով է օգտագործում |
|---------|----------------|-------------------|
| `packages/database` | Prisma schema, client, migrations | **միայն `apps/api`** |
| `packages/shared` | enums, constants, shared types | web + api (ոչ services) |
| `packages/tsconfig` | shared TS configs | բոլորը |
| `packages/eslint-config` | shared lint | բոլորը |

---

## Նախագծի կառուցվածք

```
gymhub/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   └── src/
│   │       ├── app/         # routes (public, gym, admin)
│   │       ├── features/    # UI feature modules
│   │       └── shared/      # UI kit wrappers, utils
│   └── api/                 # NestJS backend
│       └── src/
│           ├── modules/     # auth, gyms, leads, ...
│           ├── common/      # guards, filters, pipes
│           └── main.ts
├── packages/
│   ├── database/            # Prisma
│   ├── shared/              # shared types/enums
│   ├── tsconfig/
│   └── eslint-config/
├── docs/
├── .env.example
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Տվյալների հորիզոնքներ

### Lead flow

```
1. User բացում է GYM էջ (միայն active + approved)
2. Լրացնում է հայտ (անուն, հեռախոս, նշում)
3. POST /leads → NestJS վալիդացիա + rate limit
4. Lead պահվում է DB (gymId)
5. Email → GYM owner
6. GYM owner տեսնում է inbox-ում և կապ է հաստատում (պլատֆորմից դուրս)
```

### Subscription flow

```
1. GYM owner ընտրում է պլան / վճարում է
2. Payment gateway callback → apps/api
3. GymSubscription.active մինչև endsAt
4. Cron. endsAt անցած → expired → listing թաքնվում է
5. Reminder email 3–7 օր առաջ
```

### Auth flow

```
1. Web UI → POST Nest /auth/login|register (ոչ Next API route)
2. Nest. argon2 verify → JWT access + refresh
3. Nest Role guard. USER | GYM_OWNER | ADMIN
4. Web-ը պահում/ուղարկում է token (Authorization կամ cookie) Nest-ին
```

---

## Բազային տվյալներ

### Հիմնական էնտիտիներ

| Էնտիտի | Նկարագրություն |
|--------|----------------|
| User | account + role |
| Gym | պրոֆիլ, հասցե, կարգավիճակ (draft/pending/approved/rejected) |
| GymMedia | նկարներ (R2 URLs) |
| Trainer | GYM-ի trainers |
| MembershipPlan | ցուցադրվող փաթեթներ (գին ինֆո) |
| Lead | user հայտ → gym |
| GymSubscription | ամսական listing subscription |
| Payment | GYM→Platform վճարումների գրառում |
| Review | rating/review (մանրամասները հետո) |

### ER (պարզեցված)

```
User 1───* Gym (owner)
User 1───* Lead (optional; guest leads առանց user)
Gym  1───* GymMedia
Gym  1───* Trainer
Gym  1───* MembershipPlan
Gym  1───* Lead
Gym  1───* GymSubscription
Gym  1───* Review
GymSubscription 1───* Payment
```

### Visibility կանոն

Listing public է միայն երբ.

- `Gym.moderationStatus = APPROVED`
- `GymSubscription.status = ACTIVE` և `endsAt > now`

Մանրամասն սխեմա՝ `docs/05-DATABASE.md` (scaffold-ից հետո՝ Prisma)։

---

## Ինտեգրացիաներ

| Սերվիս | Նշանակություն | Փաստաթուղթ |
|--------|----------------|------------|
| Payment GW | GYM subscription | `docs/reference/payment integration/` |
| Resend | Email | TECH_CARD 7.1 |
| Cloudflare R2 | Media | TECH_CARD 6.1 |
| Sentry | Errors | TECH_CARD 7.4 |

---

## Անվտանգություն

- JWT + argon2 + RBAC
- Helmet, CORS (web origin only)
- Rate limit specially on leads
- Validation on all DTOs
- Secrets only in env
- No platform handling of membership money → ավելի պարզ PCI scope

---

## Դեպլոյ

| Շրջակա միջավայր | Web | API |
|------------------|-----|-----|
| Development | localhost:3000 (`pnpm dev:web`) | localhost:4000 (`pnpm dev:api`) |
| Production | Vercel | Render / Fly.io |

> Local-ում web և api **առանձին** process են (մեկ հրամանով միասին չեն run լինում)։ Կապը՝ HTTP (`NEXT_PUBLIC_API_URL`)։

---

## Հիմնական որոշումներ

| Որոշում | Ընտրություն | Պատճառ |
|---------|-------------|--------|
| Frontend/Backend boundary | Next = UI only, Nest = all server | մաքուր մեկնարկ, մեկ API |
| API | NestJS առանձին | հաստատված պահանջ |
| Monorepo | Turborepo size C | shared contracts + երկու app |
| Money model | Subscription only | BRIEF |
| Roles | 3 | MVP պարզություն |
| Search | Postgres filters | բավարար pilot-ի համար |

---

## Կապված փաստաթղթեր

- [BRIEF.md](./BRIEF.md)
- [TECH_CARD.md](./TECH_CARD.md)
- [03-BOUNDARIES.md](./03-BOUNDARIES.md)
- [02-TECH_STACK.md](./02-TECH_STACK.md)
- [04-API.md](./04-API.md)
- [05-DATABASE.md](./05-DATABASE.md)
- [DECISIONS.md](./DECISIONS.md)
- [PROGRESS.md](./PROGRESS.md)
- [PROJECT_INIT.md](./PROJECT_INIT.md)

---

**Փաստաթղթի տարբերակ.** 1.0  
**Ամսաթիվ.** 2026-07-19
