# Որոշումների մատյան. GymHub

> Կարճ ADR-ոճի գրառումներ։ Մանրամասն կաղապար՝ `docs/reference/templates/ADR_TEMPLATE.md`։

---

## ADR-001. Product model — paid directory + leads

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** GYM-ը վճարում է ամսական listing fee. User membership վճարումը պլատֆորմից դուրս է. Platform % չի վերցնում։
- **Հետևանք.** Payment scope = GYM→Platform միայն. Ավելի պարզ legal/PCI։

## ADR-002. Stack — Next.js + NestJS monorepo (Size C)

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** `apps/web` (Next.js) + `apps/api` (NestJS) + `packages/*`, pnpm + Turborepo։
- **Հետևանք.** Առանձին հոսթինգ, CORS, shared contracts package։

## ADR-007. Clean separation — Next UI only, Nest owns the server

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** Next.js-ը պատասխանատու է **միայն frontend**-ի համար (UI, routing, SEO, Nest API client)։ Բոլոր լուրջ հարցերը՝ auth, RBAC, validation (truth), DB/Prisma, leads, subscriptions, payments, R2, email, cron, webhooks — **միայն NestJS**։
- **Արգելված web-ում.** `app/api` բիզնես routes, Server Actions բիզնեսի համար, Prisma/DB access, Auth.js որպես auth source, payment/email/R2 server logic։
- **Հետևանք.** Մեկ API մակերես (Swagger), ավելի մաքուր մեկնարկ, ավելի հեշտ mobile client հետո։
- **Մանրամասն checklist.** [`docs/03-BOUNDARIES.md`](./03-BOUNDARIES.md)

## ADR-003. Roles — 3 RBAC roles for MVP

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** `USER`, `GYM_OWNER`, `ADMIN`։ Առանձին manager role չկա։
- **Հետևանք.** Gym staff = նույն owner account մինչև multi-staff պահանջ։

## ADR-004. Lead handoff — platform does not mediate contact

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** Lead-ը պահվում և ցուցադրվում է gym inbox-ում (+ email). Հետագա կապը gym-ի պատասխանատվությունն է։
- **Հետևանք.** Չկա chat/call tracking MVP-ում։

## ADR-005. Search — Postgres first

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** MVP որոնումը PostgreSQL filters. Meilisearch՝ աճից հետո։
- **Հետևանք.** Ավելի քիչ infra MVP-ում։

## ADR-006. Payment provider — deferred choice

- **Կարգավիճակ.** Proposed
- **Որոշում.** Gateway ընտրությունը (Ameria / Arca / IdRam / այլ) կկատարվի subscription մոդուլի փուլում։
- **Հետևանք.** Abstraction (`PaymentProvider` interface) scaffold-ի ժամանակ։

## ADR-008. Responsive UI — mandatory for all frontend work

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** `apps/web`-ի **բոլոր** էջերը, կոմպոնենտները և UI փոփոխությունները պետք է լինեն **responsive** (mobile → tablet → desktop)։ Աշխատանքը համարվում է ավարտված միայն երբ mobile-ում նույնպես կարդացելի և օգտագործելի է։
- **Մոտեցում.** Mobile-first (Tailwind `sm` / `md` / `lg`)։ Արգելված է desktop-only layout առաքել։
- **Հետևանք.** Header, forms, grids, galleries, modals — բոլորը պետք է հարմարվեն փոքր էկրանին։ Agent/developer-ը UI անելիս միշտ ստուգում է responsive վիճակը։
- **Կանոններ.** `.cursor/rules/00-core.mdc`, `04-react-nextjs.mdc`, `09-figma-design.mdc`

## ADR-009. Dropdown UI — always use `DarkSelect`

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** Կայքի **բոլոր** dropdown / select UI-ները պետք է օգտագործեն `apps/web/src/shared/ui/dark-select.tsx` (`DarkSelect`)։ Native `<select>` որպես տեսանելի կոնտրոլ **արգելված է** (թույլատրվում է միայն `DarkSelect`-ի ներսում՝ form submit-ի համար, `aria-hidden`)։
- **Որտեղ.** Filters, forms (օր. register role), և ցանկացած նոր dropdown։
- **Ինչու.** Միասնական dark / lime դիզայն, portal menu (չի կտրվում `overflow: hidden`-ով), keyboard/a11y։
- **Բացառություն.** Header-ի լեզվի switcher-ը առանձին locale menu է (ոչ form select) — մնում է իր կոմպոնենտում, բայց տեսողականորեն նույն dark/lime ոճով։
- **Հիշեցում.** Նոր dropdown ավելացնելիս **միշտ** `DarkSelect`՝ մի սարքի նոր կամ native select։
- **Կանոններ.** `.cursor/rules/04-react-nextjs.mdc`, `09-figma-design.mdc` · `docs/TECH_CARD.md` (UI)

## ADR-010. TypeScript — `any` արգելված է

- **Կարգավիճակ.** Accepted (2026-07-19)
- **Որոշում.** Պրոյեկտի **բոլոր** TypeScript կոդում (`apps/web`, `apps/api`, `packages/*`) **`any` տիպը արգելված է**։ Պետք է օգտագործել միայն համապատասխան, ճշգրիտ տիպեր։
- **Եթե տիպ չկա.** Ստեղծել այն (օր. `type` / `interface`, shared package, Prisma-generated, Zod-inferred) — **ոչ** `any` կամ անհիմն `as any`։
- **Անհայտ տվյալներ.** Արտաքին/անհայտ արժեքների համար՝ `unknown` + narrowing (type guard / Zod), ոչ `any`։
- **Բացառություն.** Միայն փաստաթղթավորված, ժամանակավոր interoperability դեպք՝ մեկնաբանությամբ և հստակ պատճառով։ Default-ը միշտ՝ տիպ ստեղծել։
- **Հետևանք.** PR/review-ում `any` = block։ Agent/developer-ը տիպ չգտնելիս նախ ստեղծում է տիպը։
- **Կանոններ.** `.cursor/rules/00-core.mdc`, `03-typescript.mdc`
