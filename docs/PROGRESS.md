# Զարգացման առաջընթաց

**Նախագիծ.** GymHub  
**Փուլ.** MVP implementation (A–F)  
**Ընդհանուր առաջընթաց.** 85%

**Վերջին թարմացում.** 2026-07-19

---

## Ամբողջակ

| Փուլ | Ստատուս | Առաջընթաց |
|------|---------|------------|
| 0. Docs | ✅ | 100% |
| 1. Scaffold | ✅ | 100% |
| 2. Auth + foundation | ✅ | 100% |
| 3. Gyms + media + catalog | ✅ | 100% |
| 4. Leads | ✅ | 100% |
| 5. Subscriptions | ✅ | 100% |
| 6. Admin | ✅ | 100% |
| 7. Rich seed + SEO + UI | ✅ | 100% |
| 8. Real payment GW + Resend | ⏳ | 0% |

---

## Կատարված

- Nest foundation. env Zod, Helmet, CORS, Throttler, Swagger, ValidationPipe, exception filter, requestId
- Auth JWT + argon2 + roles USER/GYM_OWNER/ADMIN
- Public gyms catalog/filters/featured/detail + verified
- Owner portal. gym, trainers, plans, media upload (R2), leads inbox, subscription checkout (manual)
- Admin. moderation, featured, activate sub, audit log
- Leads. AM phone normalize, duplicate 24h, honeypot, trial day
- Web. home, gyms, detail+lead form, favorites, login/register, owner, admin, privacy/terms, sitemap/robots
- Web redesign. dark athletic UI, Syne/Manrope/Noto Armenian, framer-motion scroll reveals, banners
- i18n. next-intl `hy` / `en` / `ru` with locale prefix (`/hy`, `/en`, `/ru`) + language switcher
- Rich seed. 15 Yerevan gyms + owners + leads
- CI workflow `.github/workflows/ci.yml`

---

## Demo accounts (seed)

- `admin@gymhub.am` / `Admin123!`
- `owner1@gymhub.am` / `Owner123!`
- `user@gymhub.am` / `User12345!`

---

## Run

```bash
pnpm dev:api   # :4000
pnpm dev:web   # :3000
pnpm db:seed   # re-seed
```

---

## Հաջորդ (ոչ բլոկեր)

- Real payment gateway (Ameria/Arca/IdRam)
- Resend email wiring
- Telegram notify
- Reviews / compare / maps (P1)
