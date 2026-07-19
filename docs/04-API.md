# API ուրվագիծ. GymHub

**Base URL (dev).** `http://localhost:4000/api/v1`  
**Auth.** Bearer JWT (կամ httpOnly cookie — իրականացման փուլում)  
**Docs.** Swagger `/api/docs`

> **Միակ API մակերեսը NestJS-ն է.** Next.js-ում բիզնես `app/api` / Server Actions չենք ավելացնում։ Web-ը միայն HTTP client է դեպի այս endpoint-ները։

> Սա պայմանագրի ուրվագիծ է scaffold-ից առաջ։ Մանրամասն DTO-ները կավելանան մոդուլների հետ։

---

## Public

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/gyms` | Կատալոգ (միայն approved + active subscription). filters. city, price, type |
| GET | `/gyms/:slug` | GYM մանրամասն էջ |
| GET | `/trainers` | Բոլոր մարզիչները (approved + active gym). pagination. page, limit |
| POST | `/leads` | Հայտ թողնել (rate limited). body. gymId, name, phone, note? |

---

## Auth

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/auth/register` | USER կամ GYM_OWNER գրանցում |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Reset request |
| POST | `/auth/reset-password` | Reset confirm |
| GET | `/auth/me` | Ընթացիկ user |

---

## Gym owner (`GYM_OWNER`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/owner/gym` | Իր GYM պրոֆիլը |
| PATCH | `/owner/gym` | Պրոֆիլի թարմացում |
| POST | `/owner/gym/media` | Նկար upload (R2) |
| DELETE | `/owner/gym/media/:id` | Նկար ջնջել |
| CRUD | `/owner/trainers` | Trainers |
| CRUD | `/owner/plans` | Membership plans (ցուցադրում) |
| GET | `/owner/leads` | Հայտերի inbox |
| PATCH | `/owner/leads/:id` | marked as read / archived |
| GET | `/owner/subscription` | Subscription կարգավիճակ |
| POST | `/owner/subscription/checkout` | Վճարման սկիզբ |
| POST | `/owner/subscription/webhook` | GW callback (server) |

---

## Admin (`ADMIN`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/admin/owners` | GYM_OWNER user list |
| GET | `/admin/gyms` | Բոլոր GYM-երը + ֆիլտր |
| GET | `/admin/gyms/:id` | Full gym (media, trainers, plans) |
| POST | `/admin/gyms` | Create full gym (owner, details, media URLs, plans, trainers); creates owner if missing |
| PATCH | `/admin/gyms/:id` | Update full gym + nested media/plans/trainers |
| PATCH | `/admin/gyms/:id/moderation` | approve / reject |
| PATCH | `/admin/gyms/:id/featured` | toggle featured |
| GET | `/admin/subscriptions` | Subscription overview |
| POST | `/admin/subscriptions/activate` | Manual activate / extend months |
| GET | `/admin/audit` | Recent audit log |

---

## Սխալների ձևաչափ

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Անվտանգություն

- Public lead endpoint. throttle + honeypot/basic anti-spam
- Owner routes. must own gymId
- Admin routes. role guard only
- Webhooks. signature verification
