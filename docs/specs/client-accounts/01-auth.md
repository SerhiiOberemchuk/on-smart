# Client Accounts — 01 Auth

> **Status:** normative. **Depends on:** [00-overview.md](./00-overview.md) (invariants, binding decisions). **Consumed by:** rollout Phases 1 and 3.
>
> **Auth model updated 2026-07-05 (decisions #15–17).** Auth is **unified**: admins use the same `/accedi` + `/registrati` as customers. Admin privilege is granted at signup from the `ADMIN_EMAILS` env allowlist (`role = "admin"`). Email verification is **mandatory for all** (admins included). The separate admin auth (`app/actions/auth.ts`, `/admin/auth`) is **removed in Phase 3** (not "untouched"). Where sections below still describe a separate admin flow, the unified model above wins.

## 1. Current state (verified 2026-07-04)

- `lib/auth.ts` — Better Auth with `drizzleAdapter(db, { provider: "mysql", schema: { user, account, session, verification } })`; `emailAndPassword.enabled: true`; `requireEmailVerification` **commented out**; plugins `nextCookies()` + `admin()`; `secret: BETTER_AUTH_SECRET`. No `baseURL` set in config (Better Auth falls back to env `BETTER_AUTH_URL`).
- `lib/auth-client.ts` — `createAuthClient({ baseURL: "http://localhost:3000", plugins: [adminClient()] })`. The hardcoded baseURL is a **production bug** (client-side auth calls target localhost); registered in functionality.md §9. Fixed in Phase 1.
- `app/api/auth/[...all]/route.ts` — Better Auth catch-all handler (unchanged).
- `auth-schema.ts` — `user` (with `role`, `banned`, `banReason`, `banExpires`, `emailVerified`), `session`, `account`, `verification`. CLI-generated; regenerate only via the Better Auth CLI if config requires it.
- `proxy.ts` — matcher `["/admin/:path*"]`; passes `/admin/auth` through; otherwise redirects to `/admin/auth` when neither `better-auth.session_token` nor `__Secure-better-auth.session_token` cookie is present.

## 2. Target Better Auth server config (`lib/auth.ts`) — Phase 1

```ts
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { user, account, session, verification },
  }),

  baseURL: process.env.BETTER_AUTH_URL, // e.g. https://on-smart.it — required in prod

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,   // login blocked until email is verified
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthMail("reset-password", { to: user.email, url });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,          // 24 h
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthMail("verify-email", { to: user.email, url });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,     // 30 days
    updateAge: 60 * 60 * 24,          // refresh expiry at most daily
  },

  rateLimit: {
    enabled: true,                    // Better Auth built-in limiter on auth endpoints
    window: 60,
    max: 10,
  },

  plugins: [nextCookies(), admin()],  // unchanged
  secret: process.env.BETTER_AUTH_SECRET!,
});
```

Notes:
- `sendAuthMail` is the new mail helper (see §6) using **`transporterAssistance`** (binding decision #4). Mail sending must be awaited but wrapped so a mail failure surfaces as a typed error to the caller — never an unhandled throw inside Better Auth hooks.
- Enabling `requireEmailVerification` affects ONLY email/password sign-in; existing **admin users already have sessions** and admins can be marked verified directly in the DB by the owner if needed. Phase 1 acceptance re-tests admin login explicitly.
- `BETTER_AUTH_URL` must be set in production env (add to `.env.example` in the same change).

## 3. Auth client fix (`lib/auth-client.ts`) — Phase 1

Remove the hardcoded `baseURL` entirely — same-origin is the default and correct for this app:

```ts
export const authClient = createAuthClient({
  plugins: [adminClient()],
});
```

This also fixes the pre-existing production bug (functionality.md §9 item 1).

## 4. Customer auth actions — Phase 3

New domain folder `app/actions/account/` (mirrors the `app/actions/admin/` organization documented in [admin-actions.md](../../admin-actions.md)):

```
app/actions/account/
  _shared/require-customer-session.ts    (Phase 1 — see §7)
  auth/
    sign-up.ts                 createCustomerAccount
    sign-in.ts                 signInCustomer
    sign-out.ts                signOutCustomer
    resend-verification.ts     resendVerificationEmail
    request-password-reset.ts  requestPasswordReset
    reset-password.ts          resetPassword
```

Rules for every action here:
- `"use server"` first line; stable typed result `{ success, data, errorCode, errorMessage }` (code-style-rules §3, §9). Suggested error codes: `"INVALID_INPUT" | "EMAIL_IN_USE" | "INVALID_CREDENTIALS" | "EMAIL_NOT_VERIFIED" | "TOKEN_EXPIRED" | "RATE_LIMITED" | "AUTH_ERROR"`.
- Delegate to Better Auth APIs (`auth.api.signUpEmail`, `auth.api.signInEmail`, …) — do not reimplement hashing/sessions (AGENTS.md: use the library's intended API).
- **`errorMessage` values are user-facing and Italian.** Enumeration-safe wording (§9).
- Sign-in must NOT restrict roles — admins log in through the same action. It MUST reject banned users (Better Auth does this natively).
- **Role assignment at signup:** `sign-up.ts` sets `role = "admin"` when the email is in the `ADMIN_EMAILS` allowlist (via `isAdminEmail`, `lib/admin-emails.ts`), otherwise `role = "user"`. Never accept a role from the client.
- **Removing the old admin auth (Phase 3):** delete `app/actions/auth.ts` (`signUpUser`/`signInUser`/`signOutUser`) and the `app/(admin)/admin/auth` page/form; redirect `/admin/auth` → `/accedi`; `proxy.ts` admin redirect target becomes `/accedi`. `requireAdminSession()` (role-based) is unchanged and remains the admin-panel gate.
- Co-located `*.test.ts` for validation/branch logic per AGENTS.md quality gates (no real DB or Better Auth internals in tests).

## 5. Auth routes (storefront, Italian slugs) — Phase 3

New route group `app/(client)/(auth)/`:

| Route | Purpose | Form fields | Behavior |
|---|---|---|---|
| `/accedi` | Login | email, password | Supports `?redirect=<path>` (same-origin relative paths only — validate!). Success → redirect target or `/account`. `EMAIL_NOT_VERIFIED` → show resend link. Links to `/registrati`, `/password-dimenticata` |
| `/registrati` | Registration | nome, email, password, conferma password | Success → "Controlla la tua casella email" state (no auto-login before verification). Carries `?redirect=` through the verification flow |
| `/verifica-email` | Verification landing | — | Better Auth verifies via tokened URL; success state auto-signs-in and shows the primary CTA to the `?redirect=` target — labeled **"Torna al carrello"** when the flow started from the cart (decision #10) — plus secondary "Vai al mio account"; expired-token state offers resend |
| `/password-dimenticata` | Request reset | email | Always renders the same neutral confirmation (enumeration-safe) |
| `/reimposta-password` | Set new password | password ×2 | Tokened URL; expired token → link back to `/password-dimenticata` |

UI requirements: react-hook-form typed forms; async submit buttons follow the mandatory pending-state rule (AGENTS.md UX standard); all copy Italian; each page has proper `metadata` and is excluded from the sitemap.

**Header entry point** (`AccountButton`): person icon + label in the header's right cluster immediately before the cart, on all breakpoints; logged-out → `/accedi`, logged-in → dropdown; plus an "Il mio account" entry in the mobile burger drawer. It is a small async Server Component reading the session under its own `<Suspense>` boundary — **never read the session in a layout** (would force every page dynamic). Full spec: [06-user-flows.md §1](./06-user-flows.md).

## 6. Auth emails — Phase 1 (templates), Phase 3 (user-visible)

- Mail module `lib/auth-mail.ts` (`sendAuthMail`) — same plain-HTML On-Smart style as `order-mail-template.ts`, sent via **`transporterAssistance`**, `from: "On-Smart" <process.env.MAIL_USER_ASSISTENZA>`. (Placed in `lib/` so `lib/auth.ts` does not depend on `app/`.)
- Templates (subjects in Italian):
  - **verify-email** — subject `Conferma il tuo indirizzo email — OnSmart`; body: greeting by name, verification button/link, 24h validity note, "ignore if you didn't register" line, assistenza contact.
  - **reset-password** — subject `Reimposta la tua password — OnSmart`; body: reset button/link, expiry note, "ignore if you didn't request" line.
- The order-confirmation email flow (`notifyOrderById`, `transporterOrders`) is **unchanged**.
- Before Phase 3 ships: verify SPF/DKIM alignment for the assistenza mailbox and run the deliverability test matrix (gmail, libero, tiscali, outlook) — see [05-rollout.md §Risks](./05-rollout.md).

## 7. Access control

**`requireCustomerSession()`** — new file `app/actions/account/_shared/require-customer-session.ts`, mirroring `app/actions/admin/_shared/require-admin-session.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireCustomerSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Customer session is required");
  }

  return session; // { user, session } — any valid non-banned user, admins included
}
```

Enforcement rules:
1. Every action under `app/actions/account/` (except the pre-auth flows in §4) calls `requireCustomerSession()` first.
2. **Ownership lives in WHERE clauses**: every read/mutation of orders, addresses, profile, wishlist filters by `session.user.id`. Never trust a route param or client payload for ownership. Mismatch → `NOT_FOUND` result (404 rendering), not a 403.
3. `proxy.ts` — extend for the cabinet (Phase 4):

```ts
export const config = {
  matcher: ["/admin/:path*", "/account/:path*"], // + "/checkout/:path*" at Phase 7 cutover
};
```

`/account/*` without a session cookie → redirect to `/accedi?redirect=<original path>`. Same caveat as admin: the proxy is a cookie-**presence** UX gate only; real authorization is `requireCustomerSession()` + ownership filters inside actions/pages.

4. Import boundary: storefront/account UI never imports from `app/actions/admin/*`, and admin UI never imports from `app/actions/account/*`.

## 8. Sessions & cookies

- Better Auth manages cookies via `nextCookies()`; secure cookie names (`__Secure-…`) in production. Never place session tokens in URLs.
- Session lifetime 30 days with daily `updateAge` (§2) — a returning customer stays signed in across visits on the same device.
- Sign-out invalidates the server session (Better Auth `signOut`), not just the cookie.

## 9. Security requirements

- **Enumeration-safe responses**: `/password-dimenticata` and `resend-verification` always return the same neutral success ("Se l'email è registrata, riceverai un messaggio…"). Registration with an existing email returns a generic failure without confirming account existence — Better Auth's default behavior; keep the Italian `errorMessage` equally neutral.
- **Rate limiting** on all auth endpoints via Better Auth built-in limiter (§2 config).
- Password rules: min 8 chars (Better Auth default hashing — scrypt — untouched). No password hints, no security questions.
- Tokens: verification 24 h, reset per Better Auth default (1 h); single-use (library-managed).
- `?redirect=` values must be validated as same-origin relative paths before use (open-redirect guard).
