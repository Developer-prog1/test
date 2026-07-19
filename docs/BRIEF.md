# Նախագծի տեխզադրանք

> Լրացված է մեկնարկից առաջ։ Onboarding՝ [`project-onboarding` Skill](../.agents/skills/project-onboarding/SKILL.md)։

---

## Նկարագրություն

**GymHub** — Հայաստանի GYM-երի վճարովի տեղեկատու և lead պլատֆորմ։  
GYM-ի տերերը ամսական վճարում են listing-ի համար (օր. 10,000 AMD)՝ իրենց դահլիճը, նկարները, trainers-ը, փաթեթները և այլ տվյալները գեղեցիկ UI-ով ցուցադրելու համար։  
Օգտատերը գտնում է համապատասխան GYM, թողնում է հայտ — հայտը գնում է GYM-ի inbox, manager-ները կապ են հաստատում։ Պլատֆորմը չի մասնակցում հետագա վաճառքին և չի վերցնում % փաթեթներից։

## Թիրախային լսարան

1. **User (հաճախորդ)** — փնտրում է GYM Հայաստանում, համեմատում է, թողնում է հայտ։
2. **Gym owner** — վճարում է subscription, լրացնում է պրոֆիլը, ստանում է հայտեր։
3. **Admin** — մոդերացիա, approve, subscription վերահսկում։

### Հիմնական սցենարներ

- User → որոնում/ֆիլտր → GYM էջ → հայտ թողնել։
- Gym owner → մուտք → պրոֆիլ/մեդիա/փաթեթներ → հայտերի inbox → ամսական վճարում։
- Admin → GYM approve → մոդերացիա → subscription կարգավիճակ։

## Հիմնական ֆունկցիաներ (առաջնայնացված)

1. Public GYM կատալոգ + մանրամասն էջ (նկարներ, հասցե, rating, trainers, փաթեթներ) — **բարձր**
2. Lead ձև → GYM owner inbox — **բարձր**
3. Gym owner portal (պրոֆիլ, մեդիա, հայտեր) — **բարձր**
4. Gym subscription (ամսական վճարում → listing ակտիվ) — **բարձր**
5. Admin մոդերացիա / approve — **բարձր**
6. Որոնում և ֆիլտրեր (քաղաք, գին, տեսակ) — **միջին**
7. Rating / reviews — **միջին** (մանրամասները հետո)
8. Featured listing / analytics — **ցածր** (հետո)

## Stack (որոշված է)

- **Տարբերակ B** — Next.js frontend + NestJS backend
- **Չափ.** C (monorepo. `apps/web`, `apps/api`, `packages/*`)
- Package manager. pnpm + Turborepo
- **Սահման.** Next.js = **միայն frontend (UI)**. NestJS = **բոլոր լուրջ/server հարցերը** (auth, DB, business, payments, email, files, cron). Մանրամասն՝ `docs/01-ARCHITECTURE.md`։

## Դիզայն

- Figma. դեռ չկա (կավելացվի)
- UI Kit. shadcn/ui + custom visuals (գեղեցիկ gallery-առաջին UI)
- **Responsive (պարտադիր).** Կայքը պետք է լինի mobile / tablet / desktop։ Ցանկացած UI աշխատանք արվում է միայն responsive՝ desktop-only layout չի առաքվում։ Մանրամասն՝ `docs/DECISIONS.md` (ADR-008)։

## Ինտեգրացիաներ

> Բոլոր ինտեգրացիաները իրականացվում են **`apps/api` (NestJS)**-ում։ Next.js-ը միայն UI է և կանչում է Nest API։

- [x] Վճարային համակարգ — **Nest** payments (GYM → Platform subscription. Ameria / Arca / IdRam — ընտրությունը փուլում)
- [x] Email ծանուցում (Resend) — **Nest** (նոր հայտ, subscription հիշեցում)
- [x] Աուտենտիֆիկացիա — **Nest** JWT + Credentials (դերեր. `USER`, `GYM_OWNER`, `ADMIN`) — **ոչ** Auth.js/NextAuth
- [x] Ֆայլերի պահոց (Cloudflare R2) — **Nest** media module
- [ ] Քարտեզներ (Google Maps / Mapbox) — UI embed web-ում. տվյալները Nest-ից (P1)
- [ ] SMS — ոչ MVP

## Կոնտենտի լեզու

- Ինտերֆեյսի հիմնական լեզու. **hy**
- Պե՞տք է i18n. այո (hy առաջին. en/ru հետո)

## Բիզնես մոդել (ֆիքսված)

| Հոսք | Ով է վճարում | Ինչի համար |
|------|--------------|------------|
| Platform եկամուտ | GYM owner | Ամսական listing (օր. 10,000 AMD) |
| Membership/փաթեթ | User → GYM (պլատֆորմից դուրս) | Պլատֆորմը % չի վերցնում |
| Lead | Անվճար user-ի համար | Հայտը գնում է GYM inbox |

**Պլատֆորմը չի խառնվում** user↔GYM զանգերին, վաճառքին, փաթեթի վճարմանը։

## Սահմանափակումներ

- Ժամկետներ. առանց կոշտ դեդլայնի — փուլային MVP
- Pilot. նախ Երևան, հետո մարզեր
- MVP-ից դուրս. online փաթեթի վճարում, chat, mobile app, բարդ CRM, per-lead billing

## Լրացուցիչ

- Roles MVP. **3** — `USER`, `GYM_OWNER`, `ADMIN` (առանձին manager role՝ հետո)
- Rating/review և հայտի դաշտերի մանրամասները որոշվում են ժամանակի ընթացքում
- Առաջին GYM content-ը հաճախ կլցվի manual/admin կողմից
