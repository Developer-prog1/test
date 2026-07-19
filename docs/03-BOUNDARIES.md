# Frontend / Backend սահմաններ. GymHub

**Կարգավիճակ.** Պարտադիր (ADR-007)  
**Վերջին թարմացում.** 2026-07-19

> **Մեկ նախադասություն.** Next.js-ը UI է։ Backend-ական ամեն ինչ անում է NestJS-ը։

---

## Թույլատրված է `apps/web`-ում (Next.js)

- Էջեր, layout, routing (`app/**/page.tsx`, `layout.tsx`)
- UI կոմպոնենտներ, styles, animations
- i18n տեքստեր
- SEO metadata / JSON-LD (տվյալները **Nest-ից** fetch)
- Form UX + client Zod (միայն UX, ոչ trust)
- TanStack Query / `fetch` դեպի Nest `API_URL`
- Server Components-ից **միայն HTTP** կանչ Nest-ին (ոչ DB)
- `next/image`՝ արդեն upload արված URL-ների ցուցադրում
- Token/cookie-ն **ուղարկել** Nest-ին (պահել client/storage կամ cookie proxy ըստ Nest պայմանավորվածության)

---

## Արգելված է `apps/web`-ում (backend → Nest)

| Թեմա | Արգելված Next-ում | Որտեղ է ճիշտը |
|------|-------------------|---------------|
| API endpoints | `app/api/**`, Route Handlers բիզնեսի համար | `apps/api` Nest controllers |
| Server Actions | բիզնես գրել/ջնջել/վճարել | Nest REST |
| Database | Prisma, `DATABASE_URL`, raw SQL | Nest + `packages/database` |
| Auth backend | Auth.js, NextAuth, password hash, JWT sign | Nest Passport + JWT + argon2 |
| RBAC | «թաքցրած կոճակ» որպես պաշտպանություն | Nest guards |
| Validation truth | միայն client Zod-ով վստահել | Nest DTO + ValidationPipe |
| Payments | init/callback/webhook Next route | Nest payments module |
| Email | Resend/Nodemailer Next-ից | Nest |
| Files / R2 | signed URL / upload business | Nest media module |
| Cron / jobs | Vercel Cron բիզնեսի համար | Nest `@nestjs/schedule` |
| Rate limit (API) | Next middleware որպես API պաշտպանություն | Nest Throttler |
| Webhooks | payment/provider callbacks | Nest |
| Business rules | subscription active?, lead create, moderation | Nest services |

---

## Թույլատրված «server» Next-ում (ոչ backend)

Next-ը կարող է աշխատել server-ում (RSC, SSR), բայց **միայն որպես UI շերտ**.

```text
✅ RSC/SSR → HTTP GET/POST → Nest API → DB
❌ RSC/SSR → Prisma → DB
❌ RSC/SSR → hash password / charge card / send email
```

---

## Ստուգման checklist (PR / review)

- [ ] `apps/web`-ում չկա `prisma` import
- [ ] `apps/web`-ում չկա `app/api/**` բիզնես route
- [ ] `apps/web`-ում չկա Server Action բիզնես mutation
- [ ] Auth/login/register endpoint-ները միայն Nest-ում են
- [ ] Payment/email/R2/cron միայն Nest-ում են
- [ ] `packages/database`-ը import է արվում միայն `apps/api`-ից

---

## Կապված

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md) — ADR-007
- [TECH_CARD.md](./TECH_CARD.md)
- [04-API.md](./04-API.md)
