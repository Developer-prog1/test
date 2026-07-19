# Նախագծի նախաձեռնում. GymHub

**Ստեղծման ամսաթիվ.** 2026-07-19

---

## Նախագծի տեղեկություն

```yaml
Անվանում: GymHub
Նկարագրություն: Հայաստանի GYM-երի վճարովի տեղեկատու + lead պլատֆորմ
Տիպ: Web App / Marketplace (directory + leads)
Չափ: C (մեծ layout — monorepo, միջին feature scope MVP-ում)
Ժամկետ: փուլային MVP, առանց կոշտ դեդլայնի
```

---

## Նպատակ և առաջադրանքներ

### Նախագծի նպատակ

GYM-երին տալ գեղեցիկ public listing և lead ալիք. եկամուտը՝ ամսական subscription GYM տերերից։

### Հիմնական առաջադրանքներ

1. Public կատալոգ + GYM էջեր (մեդիա, տվյալներ, rating)
2. Lead → gym owner inbox
3. Gym owner portal + subscription billing
4. Admin moderation

### Թիրախային լսարան

User, Gym owner, Admin (տե՛ս BRIEF)

---

## Scope

### Մտնում է MVP-ում

- [ ] Auth + 3 roles
- [ ] Gym profile + media + trainers + plans
- [ ] Public catalog + detail (active subscription only)
- [ ] Lead form + owner inbox + email notify
- [ ] Monthly subscription checkout (GYM→Platform)
- [ ] Admin approve/reject
- [ ] hy UI

### Չի մտնում MVP-ում

- [ ] User→Gym membership online payment / commission
- [ ] Chat / call tracking
- [ ] Mobile app
- [ ] Multi-staff manager RBAC
- [ ] Meilisearch / Redis
- [ ] Full i18n (en/ru)

### Առաջնայնություններ

| Առաջնայնություն | Ֆիչեր |
|------------------|-------|
| P0 | Auth, Gym CRUD, Public listing, Leads, Subscription, Admin approve |
| P1 | Maps, reviews moderation, email verify, SEO polish |
| P2 | Featured tier, analytics, Meilisearch |

---

## Տեխնոլոգիական stack

Տե՛ս `docs/02-TECH_STACK.md` և `docs/TECH_CARD.md`։

| Շերտ | Ընտրություն |
|------|-------------|
| Web | Next.js 16 — **UI only** |
| API | NestJS 11 — **system of record** (auth, DB, business, payments, …) |
| DB | PostgreSQL + Prisma (api only) |
| Monorepo | pnpm + Turborepo |

---

## Նախագծի կառուցվածք (Size C)

```
gymhub/
├── apps/web/
├── apps/api/
├── packages/database/
├── packages/shared/
├── packages/tsconfig/
├── packages/eslint-config/
└── docs/
```

---

## Փաստաթղթավորում

### Պարտադիր

- [x] README.md
- [x] docs/01-ARCHITECTURE.md
- [x] docs/03-BOUNDARIES.md
- [x] docs/PROGRESS.md
- [x] .env.example
- [x] docs/BRIEF.md
- [x] docs/TECH_CARD.md

### Լրացուցիչ

- [x] docs/02-TECH_STACK.md
- [x] docs/04-API.md
- [x] docs/05-DATABASE.md
- [x] docs/DECISIONS.md

---

## Մեկնարկի checklist

### Պատրաստություն

- [x] Product brief լրացված
- [x] TECH_CARD հաստատված (stack)
- [ ] Neon DATABASE_URL
- [ ] R2 credentials
- [ ] Resend API key
- [ ] Payment gateway credentials (subscription փուլ)
- [ ] Figma (ոչ պարտադիր scaffold-ի համար)

### Նախաձեռնում (կոդ)

- [ ] Turborepo scaffold
- [ ] apps/web + apps/api
- [ ] Prisma schema v1
- [ ] .env տեղական
- [ ] Առաջին dev run (web + api)

### Պատրաստ զարգացման

- [ ] Auth աշխատում է
- [ ] Seed admin user
- [ ] Public gym page stub

---

## Հաջորդ քայլեր

1. [ ] Monorepo scaffold
2. [ ] Prisma enums + User/Gym base
3. [ ] Auth module
4. [ ] Public + owner + admin route shells

---

**Հեղինակ.** product onboarding (AI + team)
