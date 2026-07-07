# Functionality — As-Built Behavior

> This document describes **current production behavior**. If a change alters behavior described here, updating this file is part of the change (AGENTS.md → Mandatory agent checks).
> Orientation: [project-overview.md](./project-overview.md). Structure & rationale: [architecture.md](./architecture.md). Rules: [code-style-rules.md](./code-style-rules.md).

## 1. Catalog & navigation

**Data source:** self-hosted MySQL via Drizzle. Products are managed in the admin panel; there is no external catalog feed at runtime.

- **Catalog pages:** `/catalogo` (all), `/catalogo/[category]`, `/catalogo/[category]/[brand]`. Server components streaming through `<Suspense>` islands.
- **Filtering pipeline:** URL search params → `lib/catalog/catalog-query.ts` + `lib/get-catalog-filters.ts` (typed payload) → `app/actions/product/get-all-products-filtered.ts`, which filters/sorts/paginates **in SQL**: category/brand slugs, characteristics via `JSON_OVERLAPS`, price range, sort `price-asc | price-desc | new`, `mode: parentsOnly | all`, `limit` capped at 100. URL state is managed with `nuqs`.
- **Product page:** `/catalogo/[category]/[brand]/[slug]` → `app/actions/product/get-product-by-slug.ts`. Bundles (kits) have their own route `.../bundle/[slug_bundle]` and schema (`db/schemas/bundle-meta.schema.ts`).
- **Landing pages:** `/categoria/[categoria]`, `/brand/[brand_slug]`.
- **Global search:** header search → `app/actions/search/get-global-search-results.ts` — SQL `LIKE` across name/nameFull/slug/brand/category/EAN/keywords with EAN normalization; returns only in-stock, non-hidden products.
- **Visibility rules:** `isHidden = true` removes a product from the storefront but keeps it editable in admin. Quantity `0` keeps the product on-site labeled **"IN ARRIVO"**. These are distinct mechanisms — do not conflate them.

## 2. Cart

Client-only; **there is no server-side cart**.

- `store/basket-store.ts` (`useBasketStore`) — persisted to **localStorage** key `"carello"`: `basket` (`{productId, quantity}[]`), `productsInBasket` (product snapshot), add-to-cart popup flag, `hasHydrated` guard.
- Add-to-cart flows through the dialog in `components/ProductCard/dialog-add-to-cart/` (quantity/variant selection), state in `store/card-dialog-store.ts`.
- Cart page `/carrello`: item list (`CardSection.tsx`), summary sidebar (`RepilogoComponent.tsx`), "Acquistati insieme" recommendations. Totals computed client-side in `utils/get-prices.ts` / `utils/useCalcTotalSum.tsx` — **for display only**; the server recomputes everything at order creation (§4).
- The discount-code input (`InputSconto.tsx`) is **UI-only** — no server-side discount logic exists (see §8).

## 3. Checkout — single-page, account-only

The multi-step guest wizard and `store/checkout-store.ts` were **removed** (client-accounts Phase 8, 2026-07). Checkout now **requires a logged-in account**: `proxy.ts` gates `/checkout/:path*` (guests → `/registrati?redirect=/carrello`); old step URLs (`/checkout/informazioni` etc.) redirect to `/checkout` via `next.config.ts`.

1. **Start (`/carrello`)** — `RepilogoComponent.handleProceedToOrder` rejects an empty basket and navigates to `/checkout`.
2. **`/checkout`** (`app/(client)/checkout/page.tsx` → `AccountCheckoutClient.tsx`). Server-side session gate; a `<Suspense>` island fetches the customer's `customer_profiles` + `user_addresses`. One page, all preselected from the account:
   - **Order summary** from the cart (`store/basket-store.ts`).
   - **CONSEGNA** (`components/ConsegnaSection.tsx`) — `CONSEGNA_CORRIERE` / `RITIRO_NEGOZIO` (free pickup, Avellino), default from the profile; for courier, a saved-address picker plus an inline "+ Nuovo indirizzo" form (reuses `AddAddressForm` / `createAddress`, saves to `user_addresses`, auto-selected after `router.refresh()`).
   - **FATTURAZIONE** (`components/FatturazioneSection.tsx`) — Privato/Azienda identity from the profile (email read-only) with a per-order "Richiedi fattura" toggle preset from `requestInvoiceDefault`. Incomplete profile → an inline mini-form (`components/CheckoutBillingForm.tsx`, reuses `updateCustomerProfile`; hidden fields carry the existing order defaults so they are not wiped).
   - **PAGAMENTO** — `PAYMENT_METHODS` radio (`types/bonifico.data.ts`), default preselected; PayPal shows the +4% surcharge live.
   - The chosen widget (`components/pagamento/{paypal,sumup,klarna,bonifico}/`) receives its data as **props** (from the account + cart) and creates + pays the order. Payment errors → `/checkout?payment_error=…`.
3. **Completion — `/checkout/completato/[order]`** (`PageCompletato.tsx`). Server-loads order + payment by number; `CompletionCleanup.tsx` clears the cart (`basket-store`); orders with a `userId` show a "Vedi l'ordine nel tuo account" link. SumUp has an extra server callback page `completato/[order]/sumup/` (§5). These pages stay reachable logged-out (payment redirects).

## 4. Order creation (server-authoritative)

`app/actions/orders/create-order.ts` (`createOrderAction`):

1. Rejects an empty basket and rejects callers without a session (ordering is account-only; the guard also covers direct action invocation).
2. Re-fetches every product from DB; validates it **exists, is not hidden, and is in stock**. Client-sent prices are ignored — unit prices come from the DB.
3. Recomputes subtotal + delivery (courier only) server-side.
4. In **one DB transaction** inserts `orders`, `order_items` (title/brand/category/image snapshot per row), and `payments` (`db/schemas/orders.schema.ts`).
5. Order id = `ulid()`; order number = `makeOrderNumber("OS")` (`utils/order-number.ts`).
6. `orders.userId` is derived **server-side from the session** (never trusted from the client). Since checkout is account-only, new orders always carry the customer's `userId`; historic guest orders keep `null`.
7. `sendMessages` flag: bonifico sends confirmation email + Telegram inline; online-payment methods pass `false` and defer notification to `notifyOrderById` after successful capture (§6).

Order/payment status enums: `types/orders.types.ts`, `types/payments.types.ts`. Status updates: `app/actions/orders/udate-order-info.ts` (note the filename typo — kept, see §8) and `app/actions/payments/payment-order-actions.ts`.

## 5. Delivery & payments

**Delivery** (`types/delivery.data.ts`): flat **€8** courier shipping in Italy, **free over €600**; `RITIRO_NEGOZIO` always free. Country fixed to `IT`. No live carrier rates. Fulfillment fields (`trackingNumber`, `carrier`, `shippedAt`, `deliveredAt`) are set later by admin (`/admin/dashboard/orders/[id]`).

**Payment methods** — each a client widget in `components/pagamento/` orchestrating order creation + payment:

| Method | Flow | Statuses | Rollback / failure |
|---|---|---|---|
| **PayPal** (`paypal/PayPalPaymentWidget.tsx` + `PayPalButtonsClient.tsx`; actions `app/actions/pay-pay/pay-pal.ts`; REST client `lib/paypal.ts`) | createOrder → internal DB order (payment `CREATED`) → PayPal order → onApprove → capture → payment `PAYED`, order `PAID` → `notifyOrderById` → redirect | `CREATED → PAYED` / `PAID` | `deleteOrderByOrderId` on cancel/error; `?payment_error=paypal_*` on riepilogo. **Buyer pays +4% surcharge** — `PAYPAL_COMMISSION_RATE = 0.04` in `utils/get-prices.ts` (PayPal only). Legacy SDK; V6 migration = to-do #13 |
| **SumUp** (`sumup/SumUpWidget.tsx`; actions `app/actions/sumup/action.ts`) | createSumUpCheckout (REST `api.sumup.com`) → hosted widget → redirect to server callback page `checkout/completato/[order]/sumup/` which **re-checks status server-side** (`getSumUpCheckoutStatus`) and persists `PAYED`/`FAILED`/`PENDING` → notify | `CREATED → PAYED/FAILED/PENDING` | Callback page is authoritative; `deactivateCheckoutSumUp` for cleanup |
| **Klarna** (`klarna/KlarnaPaymentWidget.tsx` + `KlarnaScript.tsx`; actions `app/actions/klarna/`; REST client `lib/klarna.ts`) | create session → authorize in widget → place Klarna order → payment `PAYED` → notify | `CREATED → PAYED` | Widget errors surface as toasts; no order left behind on authorize failure |
| **Bonifico** (`bonifico/BonificoPaymentWidget.tsx`) | Creates order immediately with payment `PENDING_BONIFICO`, shows IBAN/BIC (`types/bonifico.data.ts` ← `contacts-adress/`), notifies, redirects to completato | `PENDING_BONIFICO` until manually confirmed in admin | n/a (no PSP) |

## 6. Notifications & email

SMTP via nodemailer, `lib/mail-transporter.ts`: `transporterOrders` (orders mailbox), `transporterAssistance` (support mailbox), `transporterGoogle` (owner Gmail). No Resend/SendGrid.

- **Order confirmation:** `app/actions/notify-order-by-id/notify-order-by-id.ts` (`notifyOrderById`) and `app/actions/mail/mail-orders.ts` build HTML from `app/actions/mail/order-mail-template.ts` and send **two emails**: store inbox (`[NUOVO ORDINE] #…`) and customer (`Conferma Ordine #…`). Plus a **Telegram** message (`app/actions/telegram/send-message.ts`) with an "Apri ordine" admin deep-link. Mail failures are caught and logged — they never block the order.
- **Assistance form:** `app/actions/mail/mail-assistance.ts` (via assistenza mailbox).
- **Product reviews:** `app/actions/product-reviews/create-review.ts` — emails assistenza + Telegram on new review.

## 6-bis. Withdrawal function — "funzione di recesso" (art. 54-bis Codice del Consumo)

Mandatory for contracts concluded from 19 June 2026 (D.Lgs. 209/2025, transposing Dir. (EU) 2023/2673 art. 11a). The online withdrawal statement asks name + order number + email; the submit button is the statutory "funzione di conferma" and is labelled exactly **"Conferma recesso"**; the entry links use the statutory label **"Recedere dal contratto qui"**.

- **Entry page:** `/recesso` (`app/(client)/(pryvacy-pages)/recesso/page.tsx`) — describes the process, CTA "Recedere dal contratto qui" → `/account/recesso`, plus a collapsed **guest fallback form** (`GuestRecessoFallback.tsx`) for orders concluded without an account — legally required until every guest order's withdrawal window closes (recital 36: withdrawal must not be more burdensome than conclusion; guests concluded without login). Linked from the footer legal row on every page (continuous availability, comma 3), the privacy-pages sidebar, `/garanzia` §2 and the sitemap.
- **Account function (primary):** `/account/recesso` (`getAccountWithdrawalOrders`) — the customer **picks the order from their own list** (radio, with item titles; CANCELED/REFUNDED excluded, orders with an existing request shown with status), nome/email prefilled (recital 37: a logged-in consumer must not re-identify). Sidebar entry "Diritto di recesso". Also per-order: `RecessoSection` on `/account/ordini/[orderNumber]` (fixed order, prefilled).
- **Submission:** `app/actions/withdrawal/submit-withdrawal-request.ts` (shared form `components/WithdrawalForm.tsx`) — session optional, enumeration-safe (never reveals whether an order exists; the order is linked only when the email matches or the logged-in user owns it, otherwise recorded unlinked for manual triage). Duplicate active requests per orderNumber+email are rejected.
- **Receipt (comma 6):** `lib/withdrawal-mail.ts` (`sendWithdrawalMails`) sends **two** emails via `transporterOrders` (the proven-deliverable order mailbox — NOT assistenza, which was undeliverable): the customer acknowledgment on a durable medium (statement content + **date and time of transmission**, Europe/Rome) and an owner copy to `MAIL_USER_ORDERS` (`replyTo` the customer, subject `[RECESSO] #… - …`). The two sends are independent (`Promise.allSettled`); a customer-receipt failure is flagged in the Telegram alert (`app/actions/telegram/send-withdrawal-message.ts`). A mail failure never undoes the registered statement.
- **Storage:** `withdrawal_requests` table (`db/schemas/withdrawal-requests.schema.ts`, migration `drizzle/0033_withdrawal_requests.sql`) — a legal record: snapshots of nome/email/orderNumber; FKs to orders/user are `set null`. Status enum RECEIVED → PROCESSING → ACCEPTED/REJECTED.
- **Admin:** dedicated section **`/admin/dashboard/returns`** ("Відмови (recesso)" in the sidebar) lists all requests (`getAllWithdrawalRequests`) with submission timestamp, order link, customer, note, and an inline status selector; filter by status + search. `OrderWithdrawalCard` shows the same per-order on the order detail. Both use `app/actions/admin/withdrawals/update-withdrawal-status.ts` (revalidates the returns list).

## 7. Admin panel (`/admin/dashboard/*`, Ukrainian UI)

Access: `role === "admin"` — `proxy.ts` gates `/admin/*` (redirects to `/accedi` without a session cookie), every admin action calls `requireAdminSession()` (see [admin-actions.md](./admin-actions.md)). Admins log in through the **unified** `/accedi` flow (there is no separate admin auth); `role="admin"` is assigned at registration from the `ADMIN_EMAILS` allowlist. Full model: [specs/client-accounts/01-auth.md](./specs/client-accounts/01-auth.md).

| Section | Capabilities |
|---|---|
| `products` (+ `[id]`) | CRUD, copy-as-new, hide (`isHidden`), photos (S3, drag-order), documents, characteristics, details, specifiche, related products, keywords, "Save all" |
| `bundles` | Bundle CRUD, copy, composition |
| `brands`, `categories`, `characteristics`, `banners` | Reference-data CRUD |
| `orders` (+ `[id]`) | Order list/detail, status updates, fulfillment (tracking number, carrier, shipped/delivered dates) |
| `payments` | Payment records overview (incl. manual bonifico confirmation) |

## 8. SEO & misc

- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `next-sitemap`; JSON-LD via `lib/seo/` (`schema-dts`); canonical redirects (www ↔ non-www) in `next.config.ts` using `types/baseUrl.ts`; `BingSiteAuth.xml`.
- Google reviews section on home: Apify-scraped, cached `hours` (`app/actions/goodle-reviews/`).
- Analytics: Google gtag in `app/(client)/layout.tsx`.

## 9. Known gaps & quirks (registered — do not "fix" in passing)

These are known and intentional-until-scheduled. Do not silently change them while working on something else; reference this list instead.

| # | Item | Status |
|---|---|---|
| 1 | ~~`lib/auth-client.ts` hardcodes `baseURL: "http://localhost:3000"`~~ | **Fixed 2026-07-05** (same-origin default). Note: `authClient` was actually unused live (admin login goes through the `signInUser` server action), so impact was latent |
| 2 | Discount input `app/(client)/carrello/components/InputSconto.tsx` is UI-only; no server discount logic | Backlog, unscheduled |
| 3 | `app/actions/test.ts` — dead Odoo experiment (`obriym.odoo.com`, env `ODOO`); not called by the store | Dead code, removal candidate |
| 4 | `components/home-sections/google-review-section/ReviewList/action.ts` — stubbed with fake data; its `API_URL`/`API_TOKEN` fetch is commented out | Dead code; live reviews come from Apify path |
| 5 | `/testova` test route in `app/(client)/` | Dev leftover, removal candidate |
| 6 | Folder/file typos kept to avoid churn: `app/actions/goodle-reviews/`, `db/schemas/caregory-products.schema.ts`, `app/actions/orders/udate-order-info.ts` | Intentionally NOT renamed (import churn > benefit) |
| 7 | SumUp env duplication: `SUMUP_API_KEY`/`SUMUP_MERCHANT_CODE` (in `action.ts`) vs `SUM_UP_MERCHANT_CODE`/`SUM_UP_ACCESS_TOKEN` (in `sumup-constans.ts`) | Consolidation candidate; both sets currently required |
| 8 | Function audit for critical bugs / query optimization | to-do.md #12 (deferred) |
| 9 | PayPal legacy SDK → V6 migration | to-do.md #13 (planned; do NOT combine with client-accounts phases) |
| 10 | Guest orders have `orders.userId = null`; historic guest orders will **never** be linked to future customer accounts (owner decision) | By design — see [specs/client-accounts/00-overview.md](./specs/client-accounts/00-overview.md) |
| 11 | Two legacy route-level `loading.tsx` files (`app/(client)/carrello/loading.tsx`, `app/(admin)/admin/dashboard/loading.tsx`) — `loading.tsx` is now **forbidden** (AGENTS.md "Instant Shell & Streaming", code-style-rules §18) | Migration scheduled: to-do.md #21 |
