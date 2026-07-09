# Project Overview

> Orientation document. Read this first when you are new to the project.
> Behavior details: [functionality.md](./functionality.md). Technical structure: [architecture.md](./architecture.md).
> Engineering rules: [code-style-rules.md](./code-style-rules.md) (authoritative). Agent entry point: [/AGENTS.md](../AGENTS.md).

## What OnSmart is

**OnSmart** (`https://on-smart.it`, hardcoded in `types/baseUrl.ts`) is a **live e-commerce store for the Italian market** selling video surveillance systems, alarms, and smart-home equipment. It is backed by a physical store/warehouse in Avellino, Italy (in-store pickup is a delivery option). The site is in production and processing real orders — **production stability is the highest-priority rule** (see AGENTS.md).

- **Storefront language: Italian** (route slugs too: `carrello`, `catalogo`, `checkout/consegna`, …).
- **Admin panel language: Ukrainian** (the owner/operators are Ukrainian-speaking).
- Single locale, no i18n library — language is fixed per audience.

## Audiences and roles

| Audience | Access today | Notes |
|---|---|---|
| Anonymous shoppers | Whole storefront, guest checkout | Guest checkout still active; `orders.userId` is `null` until the account checkout ships (Phase 6) |
| Registered customers | Register/login (`/registrati`, `/accedi`), account area at `/account` | Unified auth (2026-07-05); cabinet/checkout being built per the active spec |
| Admin operators | `/admin/dashboard/*` (`role="admin"`) | Same unified login (`/accedi`); admin role from the `ADMIN_EMAILS` allowlist; `proxy.ts` gate + `requireAdminSession()` |

## Site map at a glance

| Area | Routes |
|---|---|
| Home | `/` |
| Catalog | `/catalogo`, `/catalogo/[category]`, `/catalogo/[category]/[brand]`, `/catalogo/[category]/[brand]/[slug]` (product), `/catalogo/[category]/[brand]/bundle/[slug_bundle]` (bundle) |
| Landing pages | `/categoria/[categoria]`, `/brand/[brand_slug]`, `/chi-siamo` |
| Cart & checkout | `/carrello` → `/checkout/informazioni` → `/checkout/consegna` → `/checkout/pagamento` → `/checkout/riepilogo` → `/checkout/completato/[order]` |
| Policy pages | `/cookies`, `/garanzia`, `/informativa-sulla-privacy`, `/pagamento`, `/spedizione` |
| Account & auth | `/accedi`, `/registrati`, `/verifica-email`, `/password-dimenticata`, `/reimposta-password`, `/account` |
| Admin | `/admin/dashboard/{banners,brands,bundles,categories,characteristics,orders,payments,products}` (login via `/accedi`) |

Route constants for storefront navigation live in `types/pages.types.ts` (`PAGES`). Full behavior of every area: [functionality.md](./functionality.md).

## Environments & deployment

- **Local dev**: `npm run dev` (Next.js 16 + Turbopack). Local MySQL 8.0 via `docker-compose.yml` (db `onsmart_dev`, port 3306). Env vars from `.env` / `.env.local` — see `.env.example` for the full list of names.
- **Production**: Docker image (multi-stage `Dockerfile`, Next.js `output: "standalone"`, non-root, port 3000) hosted on **Aruba Cloud**. GitHub Actions workflow `.github/workflows/build-docker.yaml` builds and pushes `serhiioberemchuk/on-smart:latest` on push to `main`.
- **Database migrations are NEVER applied by CI or agents.** The owner generates and applies Drizzle migrations manually (see AGENTS.md "Database Rules" and `docs/code-style-rules.md` §13). Migration SQL lives in `drizzle/`; there is also a manual ops endpoint `app/api/run-migrations/route.ts`.

## External integrations map

| Service | Purpose | Config module | Env vars (names) |
|---|---|---|---|
| MySQL | Primary datastore (catalog, orders, auth) | `db/db.ts` (pooled `mysql2` + Drizzle) | `DATABASE_HOST/PORT/USER/PASSWORD/NAME`, `DATABASE_POOL_*` |
| Better Auth | Authentication (admin today; customers per active spec) | `lib/auth.ts`, `lib/auth-client.ts`, `auth-schema.ts` | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |
| PayPal | Payment (REST, +4% surcharge to buyer) | `lib/paypal.ts`, `app/actions/pay-pay/` | `PAYPAL_ENV/CLIENT_ID/CLIENT_SECRET` |
| SumUp | Card payment (hosted checkout) | `app/actions/sumup/` | `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE` (also legacy `SUM_UP_*` in `sumup-constans.ts`) |
| Klarna | Pay-later (Payments API) | `lib/klarna.ts`, `app/actions/klarna/` | `KLARNA_API_BASE/USERNAME/PASSWORD` |
| SMTP (2 mailboxes) | Order emails (`orders@`), assistance + reviews (`assistenza@`) | `lib/mail-transporter.ts` | `MAIL_HOST/PORT`, `MAIL_USER_ORDERS`, `MAIL_PASSWORD_ORDERS`, `MAIL_USER_ASSISTENZA`, `MAIL_PASSWORD_ASSISTENZA`, `MAIL_SMTP_GMAIL_PASSWORD` |
| Telegram | New-order/new-review notifications to the owner chat | `app/actions/telegram/send-message.ts` | `TG_BOT_TOKEN`, `TG_CHAT_ID` |
| Aruba S3 | Product images & documents (`on-smart.r3-it.storage.cloud.it`) | `lib/s3-files.ts`, `app/actions/files/` | `S3_REGION/ENDPOINT/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY` |
| Apify | Google-reviews scraping (daily cached) | `app/actions/goodle-reviews/` | `APIFY_API_TOKEN`, `APIFY_TASK_ID` |
| Google Analytics | Traffic analytics (gtag in client layout) | `components/analytics/` | `GOOGLE_GTAG` |
| Odoo | **Dead experiment** — not wired into the store | `app/actions/test.ts` | `ODOO` |

## Repository landmarks

There is **no `src/` folder** — the `@/*` alias maps to the repository root.

- `app/` — Next.js App Router routes only; split into `(client)` storefront and `(admin)` panel; `app/actions/` holds all server actions (the data layer).
- `db/` — MySQL pool + Drizzle client (`db.ts`) and domain schemas (`db/schemas/*.schema.ts`).
- `auth-schema.ts` — Better Auth tables (root file, CLI-generated; never hand-edit).
- `lib/` — server-side integrations and framework-agnostic logic (auth, paypal, klarna, s3, mail, catalog queries, SEO).
- `components/`, `layout-components/` — shared UI and the global shell.
- `store/` — Zustand client stores (basket, checkout wizard, dialogs).
- `types/`, `utils/` — shared types/constants (incl. the cache-tag registry) and pure helpers.
- `drizzle/` — generated SQL migrations (owner-applied).
- `proxy.ts` — Next.js 16 middleware (session-cookie gate for `/admin/*`).

Full annotated map: [architecture.md](./architecture.md).

## Documentation index (reading order)

1. **[/AGENTS.md](../AGENTS.md)** — agent entry point: hard rules, stack, folder rules, quality gates.
2. **project-overview.md** (this file) — what the product is, environments, integrations.
3. **[functionality.md](./functionality.md)** — as-built behavior of every feature (checkout trace, payments matrix, known gaps).
4. **[architecture.md](./architecture.md)** — layer model, data flow, state, auth, decision records.
5. **[code-style-rules.md](./code-style-rules.md)** — authoritative engineering rulebook (caching, actions, errors, naming).
6. **[admin-actions.md](./admin-actions.md)** — admin-only action organization and access control.
7. **[specs/client-accounts/00-overview.md](./specs/client-accounts/00-overview.md)** — ACTIVE feature spec: customer accounts (binding for all auth/account/checkout work).
8. **[to-do.md](./to-do.md)** — implementation checklist (Ukrainian).
