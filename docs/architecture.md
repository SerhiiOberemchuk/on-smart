# Architecture

> Scope: this file is the **map and the rationale**. The **rules** live in [code-style-rules.md](./code-style-rules.md) — every ruled topic below links to its section there instead of restating it. Behavior reference: [functionality.md](./functionality.md).

## 1. Layer model & request flow

```
Browser
  │  navigation / form submit / action call
  ▼
React Server Components (app/(client), app/(admin))
  │  direct calls · Promise props into <Suspense> islands (client reads them with use())
  ▼
Server Actions (app/actions/** — ~84 files, grouped by domain)   ← THE data layer
  │  typed result unions { success, data, errorCode, errorMessage }
  ▼
Drizzle ORM (db/schemas/*.schema.ts — types via $inferSelect)
  │
  ▼
MySQL (shared mysql2 pool, db/db.ts, globalThis singleton, SSL in prod)
```

- **Server actions are the data layer.** HTTP route handlers exist only where an action cannot serve the need — exactly four: `app/api/auth/[...all]` (Better Auth protocol handler), `app/api/brands` + `app/api/categories` (plain GET feeds), `app/api/run-migrations` (manual ops utility). Do not add API routes for things actions already cover (AGENTS.md folder rules).
- **Reads** follow the cached-core pattern (`*CachedCore()` with `"use cache"` inside, validating/fallback wrapper outside) — normative template in code-style-rules.md §4.
- **Mutations** never cache and always invalidate via `updateTag` — code-style-rules.md §7–8.
- **Pages are thin orchestrators.** The static structure returns instantly (`cacheComponents` extracts the shell); every DB/session-dependent fragment is a small self-fetching async server component under `<Suspense>` with a structured skeleton. `loading.tsx` is forbidden (ADR-9; rules in code-style-rules.md §18).
- **Server → client data delivery:** pages await only fast blocking things; list/secondary reads are passed as non-awaited `Promise` props into `<Suspense>` islands, read with `use()` — code-style-rules.md §15 and AGENTS.md "Instant Shell & Streaming".
- **Resilience:** transient MySQL errors are retried selectively (`utils/with-retry-selective.ts`: `ECONNREFUSED`, `ETIMEDOUT`, `PROTOCOL_CONNECTION_LOST`, … with linear backoff). Build-phase guard: `utils/guard-build.ts` (`isBuildPhase()`).

## 2. Folder map

`@/*` maps to the **repository root** — there is no `src/`. Normative rules: AGENTS.md "Folder Structure Rules".

```
app/
  (client)/            storefront routes (Italian) — pages/layouts/loading/error only
  (admin)/admin/       admin routes (Ukrainian), gated by session
  actions/             server actions by domain: product/ orders/ brands/ bundles/
                       category/ payments/ pay-pay/ klarna/ sumup/ search/ mail/
                       telegram/ notify-order-by-id/ files/ goodle-reviews/ …
    admin/             admin-only actions (requireAdminSession; see admin-actions.md)
      _shared/require-admin-session.ts
  api/                 the 4 route handlers (see §1)
  styles/              globals.css, colors.css + token layers
components/            shared feature UI (feature folders: ProductCard/, PageCatalogComponents/,
                       CheckoutPagesComponents/, pagamento/, home-sections/, …)
layout-components/     global shell: Header/, Footer.tsx
db/                    db.ts (pool + drizzle client), schemas/*.schema.ts (one domain per file)
auth-schema.ts         Better Auth tables — CLI-generated, never hand-edited (root file)
drizzle/               generated SQL migrations + meta/ snapshots (owner-applied only)
lib/                   server logic & integrations: auth.ts, auth-client.ts, catalog/, seo/,
                       image/, mail-transporter.ts, paypal.ts, klarna.ts, s3-files.ts
store/                 Zustand stores (client state)
types/                 shared types/constants incl. cache-trigers.constant.ts (CACHE_TAGS registry)
utils/                 pure helpers (prices, order-number, slug parsing, retry, guard-build)
proxy.ts               Next.js 16 middleware (renamed from middleware.ts) — cookie gate
```

## 3. Caching model (pointers)

- Central tag registry: `types/cache-trigers.constant.ts` (`CACHE_TAGS`, `CACHE_TRIGGERS_TAGS`) — the **only** source of tag strings.
- Read pattern, TTL policy (`seconds`/`minutes`/`hours`), tagging and invalidation rules: code-style-rules.md §§4–8.
- **Private per-user data is never cached with `"use cache"`** — code-style-rules.md §17 and [specs/client-accounts/03-account-area.md](./specs/client-accounts/03-account-area.md).

## 4. Client state

Zustand only — there is no React Context in source. Stores in `store/`:

| Store | Storage | Purpose |
|---|---|---|
| `basket-store.ts` | localStorage `"carello"` | Cart items + product snapshot; survives sessions; device-local by design |
| `checkout-store.ts` | sessionStorage `"checkout-storage"` | Checkout wizard state machine (`step 0–4`) + step data blocks |
| `card-dialog-store.ts` | memory | Add-to-cart dialog |
| `qnt-products-filtered.ts` | memory | Catalog filtered-count |

Choosing where state lives: **URL** (`nuqs`) for anything shareable/bookmarkable (filters, sort, pagination); **Zustand** for cross-page client state (cart, wizard); **server** for everything else — if it can be computed from the DB per request, it is not client state. Forms: react-hook-form typed against schema-derived types; `useActionState` vs `useTransition` per code-style-rules.md §14.

## 5. Authentication model

- **Better Auth** (`lib/auth.ts`): Drizzle adapter (`provider: "mysql"`), tables from root `auth-schema.ts` (`user`, `session`, `account`, `verification`), `emailAndPassword` with `requireEmailVerification`, verification/reset emails via `lib/auth-mail.ts`, plugins `nextCookies()` + `admin()`.
- **Unified auth** (2026-07-05): one flow (`/accedi`, `/registrati`, `/verifica-email`, `/password-dimenticata`, `/reimposta-password`) for everyone; customer actions in `app/actions/account/auth/*`. `role="admin"` is assigned at signup from the `ADMIN_EMAILS` allowlist (`lib/admin-emails.ts`); the separate admin auth was removed. Full spec: [specs/client-accounts/01-auth.md](./specs/client-accounts/01-auth.md).
- Two enforcement layers: `proxy.ts` (matcher `/admin/:path*`) is a lightweight cookie-presence gate (redirects to `/accedi`); the real authorization is `requireAdminSession()` (role-based, `app/actions/admin/_shared/`) for the admin panel and `requireCustomerSession()` (`app/actions/account/_shared/`) for account areas.
- The header account entry (`AccountButton`) reads the session inside its own `<Suspense>` island — never in a layout (would force every page dynamic; §17/§18).

## 6. Error handling & resilience

- Expected failures return typed unions (`ReadResult<T>`-style, `errorCode: "INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR"`) — never thrown to the UI. Rules: code-style-rules.md §9.
- Route segments own `error.tsx` as last-resort (code-style-rules.md §16); global client boundary `components/ClientErrorBoundary.tsx` in the client layout; `not-found.tsx` per segment; toasts via react-toastify.
- `unstable_rethrow` in wrappers around cached reads on render paths — code-style-rules.md §4.

## 7. Decision records (ADR)

Short records of load-bearing choices. **Append new ADRs; never rewrite or delete old ones** — supersede with a new numbered entry referencing the old.

**ADR-1 — Server actions as the data layer (not REST API routes).**
Context: single Next.js app, no third-party API consumers. Decision: all reads/mutations are server actions; route handlers only where the platform demands them (auth protocol, plain GET feeds, ops). Consequences: end-to-end typed contracts, no API-versioning surface; if an external consumer ever appears, a dedicated API layer must be added deliberately.

**ADR-2 — react-hook-form without a schema library (no zod).**
Context: forms are typed against schema-derived types; server actions re-validate authoritatively. Decision: native HTML constraints + RHF register options on the client; real validation on the server. Consequences: less client bundle and no dual-schema drift; the server action MUST validate (client validation is UX, not security). Do not introduce zod piecemeal without an owner decision.

**ADR-3 — Client-only cart, server-authoritative orders.**
Context: guest-first store, minimal infra. Decision: cart lives in localStorage; `create-order.ts` re-fetches products and recomputes all prices/stock server-side, ignoring client values. Consequences: no cart sync across devices (accepted; wishlist becomes the account-synced object per client-accounts spec); price tampering is harmless.

**ADR-4 — `use cache` + central tag registry (not route-level revalidation).**
Context: Next 16 `cacheComponents`; fine-grained entity caching needed. Decision: cached cores with tags from `types/cache-trigers.constant.ts`; mutations invalidate exact tags. Consequences: precise invalidation, no hardcoded strings; every new entity needs its tag namespace added to the registry first.

**ADR-5 — Migrations generated in repo, auto-applied at container start (strict).**
Context: live store, single production DB reachable only from inside Aruba's network (unreachable at build time), no staging environment. Decision: migration SQL is generated and reviewed in code by the owner; at container start `scripts/migrate.mjs` applies any pending migrations before the server boots, and is **strict by default** — a failed migration blocks startup (set `MIGRATE_STRICT=0` to fail-open onto the old schema). A guarded admin-only endpoint (`app/api/run-migrations/route.ts`) lets the owner trigger the same run manually. Consequences: schema changes keep a human gate at authoring/review time, but application is automatic and gated on success; agents/CI must never author or apply migrations without owner review.

**ADR-6 — Better Auth (not next-auth / hand-rolled).**
Context: needed admin auth on MySQL/Drizzle with room to grow. Decision: Better Auth with the Drizzle adapter; use its plugins (`admin`, `nextCookies`) and generated schema as-is. Consequences: customer accounts (email verification, password reset, sessions) are config, not custom code; `auth-schema.ts` stays CLI-generated.

**ADR-7 — Docker standalone on Aruba Cloud (not Vercel).**
Context: Italian hosting, S3-compatible storage already on Aruba, cost control. Decision: `output: "standalone"` image built by GitHub Actions, deployed to Aruba. Consequences: no Vercel-specific features (edge config, image CDN defaults); image optimization and caching are self-hosted concerns.

**ADR-8 — Guest checkout today → account-required checkout later.**
Context: store launched guest-only; owner decided (2026-07) to require accounts for checkout. Decision: staged transition — accounts ship first as optional (soft integration), the guest path is removed only in the final cutover phase, strictly via the `/registrati` page. Full spec: [specs/client-accounts/04-checkout-integration.md](./specs/client-accounts/04-checkout-integration.md). Consequences: `orders.userId` stays nullable in the DB forever (historic guest orders); "account required" is enforced in application code, not by a DB constraint.

**ADR-9 — Instant static shell + Suspense islands; `loading.tsx` forbidden (2026-07).**
Context: `cacheComponents` prerenders each page's static shell, but a route-level `loading.tsx` replaces the entire content area with one fallback, hiding structure the user should see instantly. Decision (owner): every page returns its static structure immediately and composes small self-fetching data components under `<Suspense>` with structured skeletons; `loading.tsx` is forbidden in new code. Consequences: two legacy files (`app/(client)/carrello/loading.tsx`, `app/(admin)/admin/dashboard/loading.tsx`) are migrated via to-do #21; granularity/file-size rules codified in code-style-rules.md §18.

## 8. How to extend this document

Add facts to §§1–6 only when structure actually changes (new layer, new store, new enforcement point). For choices, append a new ADR — Context / Decision / Consequences, ≤6 lines — and link it from the section it affects. Keep this file a map: details belong in the rulebook or the specs.
