# Client Accounts — Spec Overview

> **Status:** APPROVED FOR PHASED IMPLEMENTATION (owner decisions of 2026-07-04 are binding).
> **This spec is normative** for all customer-auth / account / checkout work. Do not deviate; do not re-litigate the decisions below. If reality contradicts the spec, stop and surface it to the owner.
>
> Reading order: this file → [01-auth.md](./01-auth.md) → [02-data-model.md](./02-data-model.md) → [03-account-area.md](./03-account-area.md) → [04-checkout-integration.md](./04-checkout-integration.md) → [05-rollout.md](./05-rollout.md) → [06-user-flows.md](./06-user-flows.md).

## Goals

1. Customer registration with **email + password** and **mandatory email verification** (Better Auth, existing nodemailer infra).
2. A personal account area ("cabinet") with:
   - **order history** — statuses, payment status, delivery status + tracking;
   - **profile + saved addresses** — powering checkout autofill;
   - **wishlist** — synced to the account.
3. Checkout ultimately **requires an account** (guest checkout removed — but only in the final rollout phase).

## Non-goals (v1)

- No social login (no Google OAuth). Email + password only.
- No server-side cart (cart stays in localStorage; wishlist is the account-synced object).
- **No linking of historic guest orders to new accounts — ever** (owner decision #6). Order history starts at account creation.
- No email-change flow (email is read-only in the profile; change-with-reverification is post-launch backlog).
- No loyalty/points, no newsletter/marketing-consent system, no admin "customers CRM" screens beyond the customer block on the order detail.
- No discount-code system (the existing `InputSconto.tsx` gap is out of scope here).

## Binding decisions log (owner, 2026-07-04)

| # | Decision |
|---|---|
| 1 | New documentation is written in **English**. |
| 2 | Checkout becomes **account-only**; the guest path is removed — but the cutover is the **last** phase, after everything else is stable in production. |
| 3 | Cabinet scope: order history (statuses, payment, tracking), profile + saved addresses (checkout autofill), wishlist. **No Google OAuth**; email+password with mandatory verification. |
| 4 | Auth emails (verification, password reset) are sent from the **assistenza** mailbox (`transporterAssistance` in `lib/mail-transporter.ts`). |
| 5 | Wishlist is **account-only**: a logged-out click on the wishlist toggle opens a dialog inviting the user to sign in. No localStorage wishlist. |
| 6 | Historic guest orders are **never linked** to new accounts (no email-matching backfill). |
| 7 | Cutover UX: guests are sent **strictly to the `/registrati` page** (no inline/embedded registration inside checkout). After verifying, the user returns to the cart on their own; the cart survives because auth never touches localStorage. |
| 8 | *(2026-07-05)* Account button: person icon + label in the header's right cluster, **immediately before the cart**, visible on all breakpoints; logged-in state shows a dropdown (account / orders / wishlist / sign out); plus an "Il mio account" entry in the mobile burger drawer. Spec: [06-user-flows.md §1](./06-user-flows.md). |
| 9 | *(2026-07-05)* ~~After every successful order, checkout step-1 data silently upserts `customer_profiles`.~~ **Superseded by #11–12:** the account checkout reads from the profile; data entered inline during checkout saves to the account immediately. |
| 10 | *(2026-07-05)* The email-verification success page shows a **"Torna al carrello"** CTA when registration started from the order flow (`?redirect=`). This does not weaken decision #7 — registration still happens only on `/registrati`. |
| 11 | *(2026-07-05)* **The account checkout is a NEW single-page checkout** (`/checkout` index): order summary, delivery (default method + default address), billing from profile, payment (default preselected), pay action — all on one page. **The existing 4-step wizard is NOT reused for account customers** — it stays untouched for guests only until cutover. |
| 12 | *(2026-07-05)* Missing account data (no address, no client type) is filled **inline on the checkout page** via mini-forms that save directly to the account — no redirects, no one-time wizard. Fill once, always ready. |
| 13 | *(2026-07-05)* Profile stores order defaults: **default payment method**, **default delivery method**, **default "richiedi fattura"** — the checkout preselects them; the customer can change per order. |
| 14 | *(2026-07-05)* After cutover (+ stability window) the old wizard is **deleted entirely** — step routes, `store/checkout-store.ts` (sessionStorage state), guest order action; old `/checkout/*` step URLs redirect to `/checkout`. |
| 15 | *(2026-07-05)* **Unified auth.** There is ONE auth flow (`/accedi`, `/registrati`) for everyone — admins included. The separate admin auth (`/admin/auth`, `app/actions/auth.ts`) is removed in Phase 3; `/admin/auth` redirects to `/accedi`. |
| 16 | *(2026-07-05)* **Email verification is mandatory for ALL accounts, admins included.** No auto-verify. Existing admin account(s) must be set `email_verified = true` in the DB before verification is enabled (Phase 3), to avoid lockout. |
| 17 | *(2026-07-05)* **Admin = env allowlist at signup.** `ADMIN_EMAILS` (env, comma-separated) lists admin emails. At registration, an allowlisted email gets `role = "admin"`, everyone else `role = "user"`. Admin-panel access stays gated by `role === "admin"` (`requireAdminSession`). Editing the allowlist does not retro-change existing accounts. |

Accepted technical defaults (not separately approved, flag to owner only if they become problematic):
- Account order-detail URLs use the public `orderNumber` ("OS…"), always constrained by `userId = session.user.id` in the WHERE clause; a mismatch renders **404** (not 403) so order numbers cannot be probed.
- Profile email is read-only in v1.

## Glossary

- **Customer** — a Better Auth user whose `role` is not `"admin"` (default `"user"`). **Admin** — `role === "admin"`; admins may also use the cabinet.
- **Verification token** — Better Auth `verification` table entry backing email-verification and password-reset links.
- **Default address** — the `user_addresses` row flagged `isDefaultShipping` / `isDefaultBilling`; used for checkout prefill.
- **Parallel run (Stage A)** — the new single-page account checkout serves logged-in customers while guests keep the untouched old wizard. **Cutover (Stage B)** — ordering requires a session; the wizard becomes unreachable. **Removal (Stage C)** — the wizard is deleted.

## Cross-cutting invariants (every phase obeys ALL of these)

1. **Production stability first.** Every phase is independently shippable and mechanically revertible. `npm run lint`, `npm test`, `npm run build` pass before merge (AGENTS.md quality gates).
2. **`orders.userId` is derived server-side from the session — never accepted from a client payload.** The account checkout sends only choices (items, addressId, methods); billing data and identity are read server-side from the account (see [04-checkout-integration.md §3](./04-checkout-integration.md)).
3. **No `"use cache"` on any session-dependent read.** The Next.js cache is shared across users; caching per-user data leaks it between users. Normative rules: [03-account-area.md §Private-data caching](./03-account-area.md) and `docs/code-style-rules.md` §17.
4. **`auth-schema.ts` stays CLI-generated.** No hand edits, no `additionalFields` customization. All business data (profile, addresses, wishlist) lives in `db/schemas/*.schema.ts` (see [02-data-model.md](./02-data-model.md)).
5. **Migrations are owner-applied only.** Agents prepare schema code and generated SQL, then STOP (AGENTS.md "Database Rules", code-style-rules §13).
6. **Storefront copy is Italian**; code, comments, and docs are English; admin UI additions are Ukrainian (AGENTS.md "Languages & Encoding" — run the mojibake check on changed files).
7. **Unified auth (superseded the earlier "admin auth untouched" rule — decisions #15–17).** Everyone uses one flow (`/accedi`, `/registrati`). Admin privilege is assigned at signup from the `ADMIN_EMAILS` allowlist; the separate admin auth is removed in Phase 3. Until then it keeps working, and `requireAdminSession()` (role-based) stays the admin-panel gate ([01-auth.md](./01-auth.md)).
8. **Do not combine with the PayPal V6 migration** (docs/to-do.md #13) in the same phase/PR.
9. **No `loading.tsx`; instant shell + Suspense islands.** Every page returns its static structure instantly; DB/session-dependent fragments are small self-fetching async server components under `<Suspense>` with structured skeletons. Granularity and file-size limits per `docs/code-style-rules.md` §18.

## Spec file map

| File | Covers | Consumed by phases |
|---|---|---|
| [01-auth.md](./01-auth.md) | Better Auth config, auth pages/actions, emails, access control | 1, 3 |
| [02-data-model.md](./02-data-model.md) | New tables, `orders.userId` policy, migration plan | 2 |
| [03-account-area.md](./03-account-area.md) | `/account/*` cabinet pages, wishlist, private-data caching rules | 4, 5 |
| [04-checkout-integration.md](./04-checkout-integration.md) | The new single-page account checkout, guest-wizard transition and retirement, admin impact | 6, 7, 8 |
| [05-rollout.md](./05-rollout.md) | Phase plan, acceptance criteria, risk register, launch checklist | all |
| [06-user-flows.md](./06-user-flows.md) | Customer journey: header account button spec + step-by-step flows for every scenario (first purchase, returning, reset, wishlist, edge cases) | 3–7 |
