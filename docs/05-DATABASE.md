# Բազային տվյալներ. GymHub

**ORM.** Prisma 7  
**DB.** PostgreSQL 17  
**Owner.** `apps/api` (NestJS) via `packages/database` — **Next.js-ը DB չի դիպչում**  
**Վերջին թարմացում.** 2026-07-19

> Սխեմայի իրական ֆայլը կլինի `packages/database/prisma/schema.prisma` scaffold-ից հետո։

---

## Enums

```text
Role                 USER | GYM_OWNER | ADMIN
GymModerationStatus  DRAFT | PENDING | APPROVED | REJECTED
SubscriptionStatus   ACTIVE | EXPIRED | CANCELED | PAST_DUE
LeadStatus           NEW | READ | ARCHIVED
PaymentStatus        PENDING | PAID | FAILED | REFUNDED
```

---

## Աղյուսակներ (MVP)

### User

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | PK |
| email | string unique | |
| passwordHash | string | argon2 |
| role | Role | |
| fullName | string? | |
| phone | string? | |
| createdAt / updatedAt | datetime | |

### Gym

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | PK |
| ownerId | uuid FK → User | |
| slug | string unique | SEO |
| name | string | |
| description | text? | |
| city | string | |
| address | string | |
| latitude / longitude | float? | P1 maps |
| phone | string? | |
| workingHours | json? | |
| moderationStatus | enum | |
| ratingAvg | decimal? | denormalized |
| ratingCount | int | default 0 |
| createdAt / updatedAt | datetime | |

### GymMedia

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| url | string | R2 public URL |
| sortOrder | int | |
| kind | string | cover / gallery |

### Trainer

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| name | string | |
| photoUrl | string? | |
| specialization | string? | |
| bio | text? | |

### MembershipPlan

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| title | string | |
| description | text? | |
| priceAmd | int | ցուցադրում միայն |
| durationDays | int? | |
| isActive | bool | |

### Lead

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| userId | uuid? FK | optional |
| name | string | |
| phone | string | |
| note | text? | |
| status | LeadStatus | NEW default |
| createdAt | datetime | |

### GymSubscription

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| status | SubscriptionStatus | |
| priceAmd | int | օր. 10000 |
| startsAt | datetime | |
| endsAt | datetime | |
| createdAt / updatedAt | datetime | |

### Payment

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| subscriptionId | uuid FK | |
| gymId | uuid FK | |
| amountAmd | int | |
| status | PaymentStatus | |
| provider | string | |
| providerRef | string? | |
| createdAt | datetime | |

### Review (P1 մանրամասներ)

| Դաշտ | Տիպ | Նշում |
|------|-----|------|
| id | uuid | |
| gymId | uuid FK | |
| userId | uuid? FK | |
| rating | int 1–5 | |
| comment | text? | |
| moderationStatus | enum | |
| createdAt | datetime | |

---

## Ինդեքսներ (սկզբնական)

- `Gym(slug)` unique
- `Gym(city, moderationStatus)`
- `Lead(gymId, status, createdAt)`
- `GymSubscription(gymId, status, endsAt)`

---

## Visibility query (կոնցեպտ)

```sql
-- public gym list
WHERE moderation_status = 'APPROVED'
  AND EXISTS (
    SELECT 1 FROM gym_subscriptions s
    WHERE s.gym_id = gyms.id
      AND s.status = 'ACTIVE'
      AND s.ends_at > NOW()
  )
```

---

## Neon connection lifecycle (`apps/api`)

`PrismaService` manages Neon idle connections:

| Event | Nest terminal log |
|-------|-------------------|
| API start / first connect | `Neon connection successful` |
| No DB queries for **5 minutes** | `Neon disconnected (idle for 5 minutes — no DB activity)` |
| Next query after idle disconnect | `Neon reconnect successful` |
| App shutdown | `Neon disconnected (app shutdown)` |

This keeps Neon from holding an idle compute/session during long quiet periods in local/dev.