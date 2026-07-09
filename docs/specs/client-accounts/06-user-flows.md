# Client Accounts — 06 User Flows

> **Status:** normative. **Depends on:** [01-auth.md](./01-auth.md), [03-account-area.md](./03-account-area.md), [04-checkout-integration.md](./04-checkout-integration.md). **Consumed by:** rollout Phases 3–7.
> This file is the single source for the customer journey: where auth entry points live and the exact step order for every scenario. Flows §2–§8 describe the **end state (after Phase 7 cutover)**; §9 lists the Stage A differences. All customer-facing copy is Italian.

## 1. Entry points

### 1.1 Header account button (`AccountButton`) — Phase 3

**Placement (owner decision #8):** in the right-hand cluster of `layout-components/Header/Header.tsx`, **immediately before `<Cart />`** (order becomes: Navigation → Search → SearchMobile → **AccountButton** → Cart → MobileMenu). Visible on all breakpoints, mirroring `Cart.tsx`: icon 24px + label "Account" hidden below `xs`. A new user/person SVG must be added under `assets/icons/` (none exists today).

**Architecture (mandatory — code-style-rules §17/§18):**
- `Header.tsx` stays a Server Component and the header stays part of the static shell. **Never read the session in a layout** — that would force every page dynamic.
- `AccountButton` is a **small async Server Component that reads the session itself** (`auth.api.getSession`), wrapped in `<Suspense fallback={<icon-shaped skeleton>}>` inside the header — a dynamic island in a static shell (canonical `cacheComponents` pattern).
- Dropdown interactivity (open/close, sign-out pending state) is a small client child component receiving only serializable session facts (e.g. user name), never the whole session object.

**States:**
| State | Render |
|---|---|
| Logged out | Link to `/accedi` (icon + "Account") |
| Logged in | Trigger (icon + first name) opening a dropdown: "Il mio account" → `/account`, "I miei ordini" → `/account/ordini`, "I miei preferiti" → `/account/preferiti`, divider, "Esci" (sign-out action with spinner pending state per AGENTS.md UX standard) |

**Mobile:** the icon stays in the top bar (like the cart). Additionally the burger drawer (`MobileMenu.tsx`) gets an "Il mio account" entry above the nav links → `/accedi` (logged out) or `/account` (logged in).

### 1.2 Other entry points

- **Cart CTA** (`/carrello`): Stage A routes by session — logged-in → `/checkout` (single page), guest → old wizard; after cutover guests see "Accedi o registrati per ordinare" → primary `/registrati?redirect=/carrello`, secondary "Accedi" → `/accedi?redirect=/carrello` ([04 §1](./04-checkout-integration.md)).
- **Wishlist heart** (logged out): dialog "Salva i tuoi preferiti — Accedi o registrati" → `/accedi?redirect=<current page>` ([03 §5](./03-account-area.md)).

## 2. Flow A — first purchase with registration (end state)

```
Catalog → Cart → /registrati → email verify → back to cart → /checkout (ONE page) → paid → order in cabinet
```

1. Customer browses the catalog and adds products to the cart — **no auth required**; the cart lives in localStorage (`store/basket-store.ts`).
2. On `/carrello` clicks the CTA → `/registrati?redirect=/carrello` (strictly the registration page — owner decision #7; no inline registration in checkout).
3. Fills nome, email, password ×2 → submit → screen "Controlla la tua casella email" (no auto-login before verification). The `?redirect` value is carried through the verification flow.
4. Opens the email (sent from the assistenza mailbox) → clicks the verification link → `/verifica-email` verifies the token → **auto sign-in** ([01 §2](./01-auth.md)).
5. The success screen shows **"Torna al carrello"** as the primary CTA because the flow carries `?redirect=/carrello` (owner decision #10), plus a secondary "Vai al mio account". Cart contents are intact — auth never touches localStorage.
6. Back on `/carrello` → "Ordina" → **`/checkout` — the single-page checkout** ([04 §2](./04-checkout-integration.md)). First order, so the page guides through its blocks inline (decision #12 — no redirects):
   - **FATTURAZIONE** renders as an inline mini-form: Privato/Azienda switch + the relevant fields → saved to `customer_profiles`;
   - **CONSEGNA**: method preselected (Corriere); "+ nuovo indirizzo" inline form → saved to `user_addresses` as the default;
   - **PAGAMENTO**: picks a method (PayPal shows +4% live); optional "Imposta come predefinito" checkbox.
7. The action area shows the chosen method's widget → the order is created with `userId` from the server session and paid (flows unchanged from today).
8. `/checkout/completato/[order]` — confirmation + "Vedi l'ordine nel tuo account". Everything typed in step 6 is already saved in the account.
9. The order appears in `/account/ordini`; both confirmation emails + Telegram notification fire as today.

## 3. Flow B — returning customer, active session (the fast path)

1. Adds to cart → `/carrello` → "Ordina" (session valid ~30 days — no auth friction).
2. `/checkout` — everything preselected from the account: default delivery method + default address, billing from profile, default payment method. Reviews the summary.
3. Pays via the widget → done. **Two clicks from cart to payment, zero typing.** Any per-order change (another address, another method) is a tap on the same page.

## 4. Flow C — returning customer, logged out

1. `/carrello` → CTA secondary link "Accedi" → `/accedi?redirect=/carrello`.
2. Signs in → redirected back to `/carrello` (redirect param validated as same-origin relative — [01 §9](./01-auth.md)).
3. Continues as Flow B from step 1.

## 5. Flow D — forgotten password (during Flow C)

1. On `/accedi` clicks "Password dimenticata?" → `/password-dimenticata` → enters email → neutral confirmation (enumeration-safe), `?redirect` carried.
2. Email link → `/reimposta-password` → new password ×2 → success → link to `/accedi?redirect=…` → continues Flow C.
3. Expired token → message + link back to `/password-dimenticata`.

## 6. Flow E — unverified user tries to sign in

1. `/accedi` with correct credentials but unverified email → blocked with `EMAIL_NOT_VERIFIED` → screen shows "Invia di nuovo l'email di conferma" (resend, rate-limited) + assistenza contact.
2. Resend → verify → auto sign-in → continues via `?redirect`.

## 7. Flow F — wishlist

1. Logged out: heart click on a product card / product page → dialog → `/accedi?redirect=<current page>` → after sign-in returns to the same page → heart toggles.
2. Logged in: optimistic toggle, idempotent server-side; items in `/account/preferiti`. No guest wishlist (owner decision #5).

## 8. Edge cases

| Case | Behavior |
|---|---|
| Session expires on `/checkout` (before paying) | The next server interaction redirects to `/accedi?redirect=/checkout`; the cart (localStorage) survives; after sign-in the page re-renders from account data (defaults restore the selections) |
| Session expires mid-payment (after order created) | Payment capture / SumUp callback complete without auth ([04 §4](./04-checkout-integration.md)); `completato` tolerates a logged-out viewer (omits the account link) |
| Verification link expired | `/verifica-email` shows expired state + resend button |
| Banned user signs in | Better Auth rejects natively; neutral Italian error |
| Logged-in user opens `/accedi` or `/registrati` | Redirect to `?redirect` target or `/account` |
| Direct URL to another user's order | 404 ([03 §2](./03-account-area.md)) |

## 9. Transition differences (before the end state)

- **Stage A (Phase 6):** two checkouts run in parallel — the `/carrello` CTA routes logged-in customers to the new single-page `/checkout` and guests to the untouched 4-step wizard. Flows A–B above already apply to logged-in customers; guests order exactly as today.
- **Cutover (Phase 7):** guests lose the wizard path — CTA → `/registrati` (Flow A); wizard code stays for mechanical rollback.
- **Removal (Phase 8):** wizard, `checkout-store`, and guest order action deleted; old step URLs redirect to `/checkout`. ([04 §1, §7](./04-checkout-integration.md))
