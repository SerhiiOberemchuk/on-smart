# Client Accounts — 03 Account Area (Cabinet)

> **Status:** normative. **Depends on:** [01-auth.md](./01-auth.md) (session, access control), [02-data-model.md](./02-data-model.md) (tables). **Consumed by:** rollout Phases 4 and 5.
> The §6 caching rules are duplicated as `docs/code-style-rules.md` §17 — they are review-blocking.

## 1. Route map

New segment `app/(client)/account/` with a shared `layout.tsx` (sidebar navigation, Italian labels). Every page is a thin orchestrator Server Component: its static shell (sidebar, headings, layout) renders instantly; every session-dependent block is a small async server component that fetches its own data, wrapped in `<Suspense>` with a structured skeleton. **No `loading.tsx`** (AGENTS.md "Instant Shell & Streaming", code-style-rules §18). Private data renders only inside dynamic Suspense islands (§6).

| Route | Label (IT) | Content |
|---|---|---|
| `/account` | — | Redirects to `/account/ordini` |
| `/account/ordini` | I miei ordini | Order list (§2) |
| `/account/ordini/[orderNumber]` | Dettaglio ordine | Order detail (§2) |
| `/account/profilo` | Il mio profilo | Profile + password change (§3) |
| `/account/indirizzi` | I miei indirizzi | Addresses CRUD (§4) |
| `/account/preferiti` | I miei preferiti | Wishlist grid (§5) |

Sidebar footer: "Esci" (sign-out, async pending state). `proxy.ts` gates `/account/:path*` → `/accedi?redirect=` ([01-auth.md §7](./01-auth.md)); every server action additionally calls `requireCustomerSession()` and ownership-filters.

New actions live in `app/actions/account/{orders,profile,addresses,wishlist}/` — typed result unions, co-located tests for validation logic.

## 2. Orders — list & detail

**List** (`/account/ordini`): rows show `orderNumber`, `createdAt`, item count, total, `orderStatus`, payment status (joined from `payments`), and a delivery hint (`trackingNumber` present → "Spedito"). Sort: newest first. Pagination: simple `LIMIT/OFFSET`, 10 per page (URL param via `nuqs`). Empty state: Italian copy + CTA to `/catalogo`.

**Detail** (`/account/ordini/[orderNumber]`):
- Lookup: `WHERE orderNumber = ? AND userId = session.user.id`. **Both conditions always** — a mismatch or missing row renders `notFound()` (404, not 403 — no order-number probing).
- Sections: items snapshot from `order_items` (title/brand/image/unitPrice/quantity as stored — historical, not live product data), billing data, delivery method + `deliveryAdress` JSON when present, fulfillment (`trackingNumber`, `carrier`, `shippedAt`, `deliveredAt`), payment block (provider, status, amount; PayPal surcharge appears as stored in the payment amount; for `PENDING_BONIFICO` reuse the IBAN block pattern from `components/CheckoutPagesComponents/components/BonificoDati.tsx`).
- Only orders created with this account appear — historic guest orders never show (binding decision #6).

## 3. Profile (`/account/profilo`)

- **Name** — editable via Better Auth user update API.
- **Email** — displayed read-only (v1; change flow is backlog).
- **Phone + company data** — editable form over `customer_profiles` (`clientType`, and per type: codiceFiscale / referenteContatto, ragioneSociale, partitaIva, pecAzzienda, codiceUnico). The same conditional field logic powers the checkout's inline billing mini-form ([04 §2](./04-checkout-integration.md)) — build it once as a shared component, two callers.
- **Order defaults (decision #13)** — "Preferenze ordine" section: metodo di pagamento predefinito (4 methods or "chiedi ogni volta"), consegna predefinita (Corriere / Ritiro), "Richiedi fattura" default (privato). The single-page checkout preselects these; per-order changes there do not alter the defaults (except the explicit "Imposta come predefinito" checkbox).
- **Password change** — Better Auth `changePassword`, requires current password; enumeration-safe errors; async pending states.

## 4. Addresses (`/account/indirizzi`)

Actions in `app/actions/account/addresses/`: `list`, `create`, `update`, `delete`, `set-default` (per kind: shipping/billing).
- Field parity with checkout consegna address fields (`user_addresses` §3 of [02-data-model.md](./02-data-model.md)).
- Max 5 addresses (validated in `create`); set-default clears the previous default in one transaction; delete requires confirmation dialog.
- Cards show label + address + "Predefinito spedizione/fatturazione" badges.

## 5. Wishlist (Phase 5 — parallelizable with Phase 4)

- **Toggle** (heart) on `components/ProductCard/CardProduct.tsx` and the product page: client component calling `app/actions/account/wishlist/toggle.ts`.
  - Logged-in: optimistic toggle, idempotent server-side (unique index — duplicate = already saved).
  - Logged-out: **no localStorage fallback** (binding decision #5) — open a small dialog: "Salva i tuoi preferiti — Accedi o registrati", linking to `/accedi?redirect=<current page>`.
- **Page** (`/account/preferiti`): grid reusing the existing product-card component; product data fetched by ids through existing cached product getters (shared catalog caches stay untouched — only the id list is per-user and uncached); remove = same toggle; out-of-stock/hidden products render with their normal storefront states.
- Initial wishlist state for heart icons: provided per page render from the server (single uncached read of the user's wishlist ids), not per-card client fetches.

## 6. PRIVATE-DATA CACHING RULES (normative — mirrored in code-style-rules.md §17)

The Next.js `"use cache"` store is **shared across all users**. Caching session-dependent data with a static key leaks one user's data to another. On a live shop this is a critical correctness/privacy failure. Therefore:

1. **Never** put `"use cache"` in any function whose result depends on the session user (orders, profile, addresses, wishlist, session itself).
2. Per-user reads run **dynamic**: the page/action reads `headers()`/`cookies()` (via `requireCustomerSession()`) and queries the DB directly — plain uncached actions. This is cheap at account-area traffic levels; correctness wins.
3. The `*CachedCore` pattern (code-style-rules §4) is **forbidden for account data in v1**. No `CACHE_TAGS.account` namespace exists — deliberately ([02-data-model.md §7](./02-data-model.md)).
4. If a future, measured need to cache per-user data arises: `userId` must be an explicit argument of the cached core (part of the cache key), with per-user tags added to `types/cache-trigers.constant.ts` first — and owner sign-off.
5. Private data is never prerendered: all session-dependent content lives inside dynamic `<Suspense>` islands (the session read forces them dynamic). The static shell of `/account/*` pages (sidebar, headings) MAY be prerendered — that is the canonical `cacheComponents` model. Verify in the build output that no per-user data ends up in static HTML.
6. Shared caches (products, brands, categories) remain fully cacheable — joining cached product data to an uncached per-user id list is the correct pattern (§5).

Review checklist addition (code-style-rules §11): _"No `"use cache"` on session-dependent reads; account pages render dynamically."_

## 7. Empty / error / pending states

- Every list page: dedicated empty state (Italian copy + relevant CTA).
- `app/(client)/account/error.tsx` at segment level (code-style-rules §16); typed `NOT_FOUND` results render `notFound()`.
- Every mutation button follows the mandatory async pending-state rule (AGENTS.md UX standard).
- `<Suspense>` skeletons match each island's real structure (no bare spinners); no `loading.tsx`.
