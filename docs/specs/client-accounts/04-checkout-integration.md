# Client Accounts — 04 Checkout Integration

> **Status:** normative. **Depends on:** [01-auth.md](./01-auth.md), [02-data-model.md](./02-data-model.md), [03-account-area.md](./03-account-area.md). **Consumed by:** rollout Phases 6, 7, 8.
> **The account checkout is a NEW single-page checkout (decisions #11–14). The existing 4-step wizard is NOT reused for account customers** — it serves guests only during the transition and is deleted afterwards. Current wizard behavior: [functionality.md §3–4](../../functionality.md).

## 1. Three-stage strategy (binding)

| Stage | Phase | State |
|---|---|---|
| **A — parallel run** | 6 | New single-page checkout at **`/checkout`** (new index route) for logged-in customers. Guests keep the **untouched** 4-step wizard (`/checkout/informazioni` → … → `/checkout/riepilogo`). The `/carrello` CTA routes by session: logged-in → `/checkout`, guest → wizard. |
| **B — cutover** | 7 | Guests can no longer order: `/carrello` CTA for guests → `/registrati?redirect=/carrello` (decision #7); proxy matcher gates `/checkout/:path*`. The wizard becomes unreachable but its code stays intact — rollback is a mechanical revert. |
| **C — removal** | 8 | After a stability window: wizard step routes, `store/checkout-store.ts`, and the guest order path are **deleted** (decision #14); old step URLs redirect to `/checkout`. |

Rationale: guests are never disturbed before cutover (production stability, invariant #1); the account experience is built clean instead of retrofitting prefill into the wizard.

## 2. The single-page account checkout (`app/(client)/checkout/page.tsx`, new index route)

One page, all decisions preselected from the account; a repeat order is "cart → Ordina → pay". Layout (top to bottom): order summary, CONSEGNA, FATTURAZIONE, PAGAMENTO, totals + payment action. Full journey: [06-user-flows.md §2–3](./06-user-flows.md).

- **Account-only from birth**: the page (Server Component) redirects to `/accedi?redirect=/checkout` when there is no session (Stage A: in-page check; Stage B adds the proxy matcher).
- **Architecture per code-style-rules §17/§18**: the page is a thin orchestrator returning the static shell instantly; each block is a small self-fetching async server component under `<Suspense>` with a structured skeleton. Profile/addresses are per-user reads — **uncached** (§17). Interactive selections are local client state; **no `checkout-store`, nothing in sessionStorage** — the cart (`store/basket-store.ts`, localStorage) remains the only client persistence.
- **Order summary**: items from the basket with server-verified prices; "modifica" links back to `/carrello`.
- **CONSEGNA block**: method radio (Corriere / Ritiro in negozio), preselected from `customer_profiles.defaultDeliveryMethod`; for courier — the default address preselected, "cambia" opens the saved-address picker, "+ nuovo indirizzo" expands an inline form that saves to `user_addresses` (decision #12). Delivery price rules unchanged (€8 / free ≥ €600 / pickup free).
- **FATTURAZIONE block**: compact summary from `customer_profiles` (clientType and the relevant fields; "Richiedi fattura" toggle preset from `requestInvoiceDefault`). Empty/incomplete profile → the block renders as an inline mini-form (Privato/Azienda switch + the same field set as today) that saves to the profile. "Modifica nel profilo" links to `/account/profilo`.
- **PAGAMENTO block**: radio of the 4 methods; `defaultPaymentMethod` preselected when set; first-time pick offers a small "Imposta come predefinito" checkbox. PayPal shows the +4% surcharge live (reuse `utils/get-prices.ts`).
- **Action area**: renders the chosen method's **existing widget** (`components/pagamento/{paypal,sumup,klarna,bonifico}/`) — the same order-creation + payment flows as today's riepilogo; bonifico shows an "Ordina" button. Async pending states per AGENTS.md.
- **Incomplete-data guard**: the pay action is disabled with a clear Italian hint until required blocks are complete (courier without address, empty billing profile).

### Payment widget refactor (Phase 6 prerequisite)
Today the widgets read `useCheckoutStore` directly. Refactor them to accept their inputs as **props**; during Stage A the wizard's riepilogo passes values from the store, the new page passes its own state. One widget codebase, two callers, zero behavior change for guests. This also unblocks deleting `checkout-store` at Phase 8.

## 3. Order creation — new action

New `app/actions/account/orders/create-account-order.ts`:

- Input (client sends only choices, never data the server already owns): `{ items: {productId, quantity}[], deliveryMethod, addressId | null, paymentMethod, requestInvoice }`.
- Server-side: `requireCustomerSession()`; **billing data read from `customer_profiles`**, delivery address read from `user_addresses` `WHERE id AND userId` (ownership); products re-validated (exist, not hidden, in stock) and prices taken from the DB — same guarantees as `createOrderAction`; one transaction inserts `orders` + `order_items` + `payments`; `userId` from the session (invariant #2); order number `makeOrderNumber("OS")` unchanged.
- Typed errors: `"PROFILE_INCOMPLETE" | "ADDRESS_REQUIRED" | "EMPTY_BASKET" | "PRODUCT_UNAVAILABLE" | "DB_ERROR"` (Italian messages).
- The guest wizard keeps using the existing `createOrderAction` untouched until Phase 8 deletes both the wizard and that action.
- Existing payment actions (PayPal / SumUp / Klarna) are reused unchanged — they receive the internal order as today.

## 4. Interaction with payment flows

- Widgets run on `/checkout` after the order row exists with `userId` set. Capture paths and the SumUp server-callback page do **not** re-require auth: a session expiring mid-payment cannot lose a paid order.
- `/checkout/completato/[order]` is **shared** by both checkouts during the transition and stays after wizard removal; it tolerates a logged-out viewer.
- PayPal rollback on cancel/error (`deleteOrderByOrderId`) unchanged.
- Do not schedule Phases 6–8 in the same release window as the PayPal V6 migration (to-do #13; invariant #8).

## 5. What explicitly does NOT change

- Delivery pricing rules (`types/delivery.data.ts`), pickup option.
- Payment methods, statuses, PayPal +4% surcharge (`utils/get-prices.ts`).
- `notifyOrderById` emails/Telegram; order email = account email.
- Order number format, ulid ids, `orders`/`order_items`/`payments` schema shape.
- `/checkout/completato/[order]` route and cleanup behavior.
- Admin fulfillment workflow.
- Guest wizard behavior — byte-for-byte untouched until Phase 8 removes it.

## 6. Admin impact (Phase 6)

- Admin order detail (`app/(admin)/admin/dashboard/orders/[id]`): "Клієнт" block when `userId` present — customer name + email via the `orders.user` relation, link to orders filtered by `?userId=`. Ukrainian labels.
- Orders list: optional `userId` filter. Guest orders (null `userId`) display as today.

## 7. Rollback procedures

- **Phase 6**: purely additive (new route + CTA branching + widget prop-refactor). Revert = one commit removing the route and CTA branch; widget refactor is behavior-neutral and can stay.
- **Phase 7**: mechanical 2-point revert — restore the guest CTA on `/carrello`, remove `/checkout/:path*` from the proxy matcher. The wizard code is still present, so guests order again immediately.
- **Phase 8**: destructive (deletion) — only after the owner confirms the stability window; preceded by a git tag for archival; redirects from old step URLs to `/checkout` ship in the same change.
