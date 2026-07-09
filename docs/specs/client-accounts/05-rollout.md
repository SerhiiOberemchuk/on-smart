# Client Accounts — 05 Rollout Plan

> **Status:** normative. **Depends on:** all of [00](./00-overview.md)–[04](./04-checkout-integration.md). Tracked in `docs/to-do.md` items #14–#20.
> Every phase: independently shippable, mechanically revertible, quality gates green (`npm run lint`, `npm test`, `npm run build`), mojibake check on changed files.

## 1. Phase dependency graph

```
1 (auth foundation) → 2 (data model) → 3 (auth UI) → 4 (cabinet) → 6 (new checkout) → 7 (cutover) → 8 (wizard removal)
                                                   ↘ 5 (wishlist) ↗
```
Phases 4 and 5 are parallelizable after Phase 3. Phase 7 starts only after 1–6 are stable in production (target: 1–2 weeks of quiet operation after Phase 6). Phase 8 starts only after Phase 7's monitored window closes.

## 2. Phases

### Phase 1 — Auth foundation (invisible to users) — spec: [01-auth.md](./01-auth.md) §§2, 3, 6, 7
**Scope:** fix `lib/auth-client.ts` hardcoded baseURL (pre-existing prod bug); `lib/admin-emails.ts` (`isAdminEmail` over `ADMIN_EMAILS`); `lib/auth.ts` config (baseURL from env, verification/reset senders wired to mail, session, rate limit); `lib/auth-mail.ts` (`sendAuthMail`) via `transporterAssistance`; `requireCustomerSession()`; add `ADMIN_EMAILS` + `BETTER_AUTH_URL` to `.env.example`.
**Critical:** `requireEmailVerification` stays **OFF** in Phase 1 and is enabled in Phase 3 — enabling it now would block the existing admin's `signInEmail` (admin login goes through `signInUser` → `auth.api.signInEmail`) until their `email_verified` is true. The admin-auth removal also waits for Phase 3 (no `/accedi` replacement yet).
**Does not touch:** any storefront UI, admin login behavior, DB schema, checkout.
**Acceptance:**
- Admin login/logout/dashboard fully unaffected — manually re-tested end-to-end (verification still off).
- Verification + reset email templates render correctly and send in dev.
- Production build green; no new routes exposed.
**Revert:** single commit revert (config + new files only).

### Phase 2 — Data model — spec: [02-data-model.md](./02-data-model.md)
**Scope:** schemas `customer-profile.schema.ts`, `user-addresses.schema.ts`, `wishlist.schema.ts`; `orders.userId` FK (`onDelete: "set null"`) + relations; generated SQL handed to owner with human-readable summary and rollback statements. **Agent stops before applying.**
**Does not touch:** any runtime code path.
**Acceptance:**
- Owner has applied the migration in production and confirmed.
- Types compile and are exported from schemas; `npm run build` green.
- Existing order creation regression-tested (guest order on at least one payment method).
**Revert:** rollback SQL provided with the migration (owner-applied).

### Phase 3 — Unified auth UI + admin unification — spec: [01-auth.md](./01-auth.md) §§4, 5, 7; [06-user-flows.md](./06-user-flows.md) §1
**Scope:** `app/(client)/(auth)/` pages (`/accedi`, `/registrati`, `/verifica-email`, `/password-dimenticata`, `/reimposta-password`); actions in `app/actions/account/auth/` (`sign-up` assigns `role` from `ADMIN_EMAILS` allowlist); header `AccountButton` (async server component under `<Suspense>`, before `<Cart />` in `layout-components/Header/Header.tsx`; new user SVG; "Il mio account" in `MobileMenu`). **Cutover to unified auth:** enable `requireEmailVerification`; remove `app/actions/auth.ts` + `app/(admin)/admin/auth` page/form; `/admin/auth` → redirect `/accedi`; `proxy.ts` admin redirect target → `/accedi`.
**Precondition (owner):** existing admin account(s) set `email_verified = true` in the DB **before** enabling verification (decision #16), else admin login breaks.
**Acceptance:**
- Full loop in production: register → email received (deliverability matrix: gmail, libero, tiscali, outlook) → verify → auto sign-in → sign-out → sign-in.
- An `ADMIN_EMAILS` email registering/logging in through the general flow gets admin access (`role = "admin"`); a non-listed email gets `role = "user"` and no admin panel.
- Admin login via the new `/accedi` reaches the dashboard; `/admin/auth` redirects to `/accedi`; old admin actions removed with no dead imports.
- Unverified sign-in blocked with working resend; enumeration-safe messages on forgot-password and re-registration.
- `?redirect=` round-trips work and reject non-relative values; verification success shows "Torna al carrello" when the flow started from the cart.
- **The header stays part of the static shell** — no session read in any layout; account island streams under its own Suspense skeleton; dropdown + sign-out pending state work.
- Italian storefront copy / Ukrainian admin copy reviewed; SPF/DKIM for assistenza mailbox verified **before** ship.
**Revert:** restore `app/actions/auth.ts` + `/admin/auth` and disable `requireEmailVerification` (keep the new customer routes); rehearse before ship since this touches live admin login.

### Phase 4 — Personal cabinet — spec: [03-account-area.md](./03-account-area.md) §§1–4, 6, 7
**Scope:** `app/(client)/account/` layout + ordini (+ detail), profilo, indirizzi; actions in `app/actions/account/{orders,profile,addresses}/`; `proxy.ts` matcher + `/account/:path*`.
**Acceptance:**
- User A can never load user B's order — direct-URL test with two accounts returns 404.
- Logged-out `/account/*` redirects to `/accedi?redirect=` and returns correctly after login.
- **Zero `"use cache"` on account reads** (review checklist); build output shows no static `/account` routes.
- Orders list/detail verified against real orders incl. a PENDING_BONIFICO and a shipped order with tracking.
- Every page returns its static shell instantly; every session-dependent block is Suspense-wrapped with a structured skeleton; **no `loading.tsx` introduced**; every mutation button has pending state.
**Revert:** remove routes + matcher entry.

### Phase 5 — Wishlist (parallel with 4) — spec: [03-account-area.md](./03-account-area.md) §5
**Scope:** wishlist actions; heart toggle on product card + product page; logged-out dialog; `/account/preferiti`.
**Acceptance:**
- Toggle idempotent (unique index respected; double-click safe).
- No shared-cache pollution: product/catalog cache behavior unchanged (spot-check cache tags).
- Preferiti page reuses the existing product card and handles hidden/out-of-stock items.
**Revert:** remove toggle + page.

### Phase 6 — New single-page account checkout (parallel run; guests untouched) — spec: [04-checkout-integration.md](./04-checkout-integration.md) §§1–3, 6
**Scope:** new `/checkout` index page (orchestrator + Suspense block components: summary, consegna, fatturazione with inline mini-forms, pagamento with profile defaults); new `create-account-order.ts` action; payment-widget refactor to props (wizard passes store values — behavior-neutral for guests); `/carrello` CTA routes by session; completato account link; admin "Клієнт" block.
**Acceptance:**
- **Guest wizard behaviorally unchanged** — full guest E2E on all 4 payment methods (PayPal, SumUp, Klarna, bonifico), specifically re-tested because of the widget prop refactor.
- Logged-in E2E on all 4 methods via the new page; order rows carry the correct `userId`; the order appears in `/account/ordini`; admin block links correctly.
- First-order inline fills persist to profile/addresses; **a second order needs zero typing** (defaults verified: address, delivery, payment, fattura).
- Incomplete-data guard blocks pay with clear Italian hints; no `"use cache"` on the per-user blocks; the page returns its static shell instantly.
- Conversion baseline captured (analytics) for cutover comparison.
**Revert:** remove the new route + CTA branching (additive); the widget prop refactor is behavior-neutral and stays.

### Phase 7 — Cutover: account-required ordering — spec: [04-checkout-integration.md](./04-checkout-integration.md) §1 (Stage B), §7
**Scope (surgically limited to):** `/carrello` guest CTA → `/registrati?redirect=/carrello`; proxy matcher `+ /checkout/:path*`. The wizard becomes unreachable; its code stays for mechanical rollback.
**Preconditions:** Phases 1–6 stable ≥1–2 weeks; launch checklist (§4) complete.
**Acceptance:**
- Logged-out user cannot reach `/checkout` or any old step URL (redirect) nor create an order via direct action invocation (`create-account-order` requires a session; wizard action unreachable from UI).
- Register-mid-purchase round trip: cart intact after register + verify (localStorage untouched); "Torna al carrello" → order completed on the new page.
- Rollback rehearsed before launch: the two-point revert (CTA + matcher) restores guest checkout cleanly.
- Conversion monitored against the Phase 6 baseline for the agreed window (owner decides the window; suggested 2 weeks).

### Phase 8 — Wizard removal (only after Phase 7's window closes) — spec: [04-checkout-integration.md](./04-checkout-integration.md) §1 (Stage C), §7
**Scope:** delete the wizard step routes (`informazioni`, `consegna`, `pagamento`, `riepilogo` + their components), `store/checkout-store.ts`, the guest `createOrderAction` path, and Stage A CTA branching; add redirects from old step URLs to `/checkout`; git tag before deletion.
**Acceptance:**
- Old step URLs redirect to `/checkout`; full E2E on the new page for all 4 payment methods after deletion.
- `rg checkout-store` returns zero references; `npm run build` green; `/checkout/completato/[order]` unaffected.
- `docs/functionality.md` §3 rewritten to describe the single-page checkout (AGENTS.md mandatory check #4).
**Revert:** git-tag restore (destructive phase — owner-confirmed only).

## 3. Risk register

| Risk | L | I | Mitigation |
|---|---|---|---|
| Verification email lost / not delivered → customer locked out | M | H | Resend button on `/verifica-email` and on blocked sign-in; assistenza contact shown; SPF/DKIM verified before Phase 3; deliverability matrix (gmail, libero, tiscali, outlook) in Phase 3 acceptance |
| Conversion drop at cutover | M | H | Stage A baseline; strict-`/registrati` UX accepted by owner (decision #7); mechanical 2-point rollback (CTA + matcher); monitored window after launch |
| Guest checkout regression from the payment-widget prop refactor (Phase 6) | M | H | One widget codebase, two callers; full guest E2E on all 4 methods in Phase 6 acceptance |
| Private-data cache leak (per-user data in shared cache) | L | **Critical** | Invariant #3; code-style-rules §17; review-checklist item; Phase 4 acceptance includes two-account isolation test |
| Admin auth regression from shared Better Auth config | L | H | Phase 1 scope minimal; explicit admin re-test in Phase 1 AND Phase 3 acceptance |
| `auth-schema.ts` regen drift (CLI overwrites hand edits) | M | M | Invariant #4: no hand edits, business fields in `db/schemas/` only |
| Cart expectation mismatch (cart is device-local; login elsewhere shows empty cart) | M | L | Accepted, documented limitation (ADR-3); wishlist is the synced object; no support promise of cart sync |
| Session expires mid-payment redirect | L | M | Capture/callback paths don't require auth ([04 §4](./04-checkout-integration.md)); completato tolerates logged-out viewers |
| Migration mis-applied on live DB | L | H | Owner-applied with human-readable summary + rollback SQL; additive-only DDL (no destructive statements in this feature) |
| Collision with PayPal V6 migration (to-do #13) | M | M | Invariant #8: never in the same phase/release window |

## 4. Phase 7 launch checklist

- [ ] Phases 1–6 in production and quiet for the agreed period.
- [ ] Conversion baseline from Phase 6 captured and documented.
- [ ] Rollback (3-point revert) rehearsed on a branch.
- [ ] Assistenza mailbox briefed (expected "can't order / didn't get email" contacts).
- [ ] Deliverability matrix re-run within the launch week.
- [ ] Owner go/no-go recorded.

## 5. Post-launch backlog (explicitly out of v1)

- Email-change flow with re-verification.
- Anonymous wishlist with merge-on-login (revisit decision #5 if customers ask).
- Admin customers overview screen (list/search customers, order counts).
- ~~Historic guest-order linking~~ — **permanently excluded** (binding decision #6).
