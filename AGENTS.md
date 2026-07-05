<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project runs **Next.js 16** (App Router, Turbopack, `cacheComponents`, React Compiler, React 19). APIs, conventions, and file structure differ from older versions and may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code that touches caching, routing, or Server Components. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Production Stability — Highest Priority Rule

**`on-smart` is a live e-commerce store serving the Italian market. Every change must keep it working.**

- The baseline is a running, deployable product (catalog, cart, checkout, payments, admin). Adding a feature that breaks an existing one is strictly worse than not adding it at all.
- Before touching any file, ask: "can this break something that currently works?" If yes — scope the change tighter or add a test first.
- New features are additions, not replacements. Existing server actions, routes, schemas, and UI components are live — modify only the parts that must change.
- `npm run lint`, `npm test`, and `npm run build` must pass after every task. A failing build is a broken store — fix it before reporting done.
- Prefer incremental vertical slices over horizontal refactors. A small working feature shipped beats a large half-finished rewrite.

## Documentation — Read Before Any Change

Project documentation lives in `docs/`:

- **`docs/code-style-rules.md`** — the authoritative engineering rulebook: Server Components, server actions, the `use cache` / `cacheTag` / `cacheLife` / `updateTag` model, error handling, naming, languages, DB policy, UI state. **Read this before any code change.**
- **`docs/admin-actions.md`** — how admin-only actions are organized (`app/actions/admin/*`), access control via `requireAdminSession()`, naming and import boundaries. Read before building or modifying any admin feature.
- **`docs/to-do.md`** — current implementation checklist. Work step by step; mark items done as you go.
- **`docs/project-overview.md`** — orientation: what the product is, environments, deployment, integrations map. Read first when new to the project.
- **`docs/functionality.md`** — as-built behavior of every feature (checkout trace, payments matrix, known gaps & quirks). **MUST be updated in the same change whenever user-visible behavior changes.**
- **`docs/architecture.md`** — layer map, data flow, state, auth model, and decision records (ADRs). Read before structural changes; append ADRs, never rewrite them.
- **`docs/specs/client-accounts/`** — **ACTIVE feature spec: customer accounts.** Binding for all auth/account/checkout work; start at `00-overview.md`. Do not deviate from its binding decisions and invariants.

**Mandatory agent checks:**
1. Before any new server action, schema, or admin screen — open `docs/code-style-rules.md` and `docs/admin-actions.md` and follow them.
2. After implementing a stage — update `docs/to-do.md`.
3. After every task — run `npm run lint`, `npm test`, `npm run build` and fix all failures before reporting done.
4. If a change alters user-visible behavior — update `docs/functionality.md` in the same change.

This `AGENTS.md` is the high-level map. When it and `docs/code-style-rules.md` overlap, `docs/code-style-rules.md` is the detailed source of truth.

## Tech Stack (do not swap without explicit instruction)

| Concern | Tool |
|---|---|
| Framework | Next.js 16 App Router (Turbopack, `output: "standalone"`, `cacheComponents`, `reactCompiler`) |
| UI | React 19 Server Components by default; `"use client"` only when required |
| Database | **MySQL** via `mysql2` pool + **Drizzle ORM** (`drizzle-orm/mysql2`) |
| Auth | **Better Auth** with `admin` plugin + `nextCookies` (`lib/auth.ts`, `lib/auth-client.ts`) |
| Styling | Tailwind CSS v4 (`app/styles/globals.css`), `clsx` + `tailwind-merge` |
| Forms | React Hook Form |
| URL state | `nuqs` |
| Client state | Zustand stores in `store/` |
| Payments | PayPal, Klarna, SumUp, bonifico (bank transfer) |
| File storage | AWS S3 SDK → `on-smart.r3-it.storage.cloud.it` |
| Email / notify | `nodemailer` (`lib/mail-transporter.ts`) + Telegram |
| Carousels | `swiper`, `embla-carousel-react` |
| Toasts | `react-toastify` |
| Tooltips | `react-tooltip` (no native `title` when a library tooltip is intended) |
| Tests | Vitest (`vitest run --pool=threads`) |
| Lint / format | ESLint (flat config) + Prettier (`printWidth: 100`, `prettier-plugin-tailwindcss`) |

Prefer the library's intended API over custom wrappers. Do not replace Better Auth, Drizzle, React Hook Form, or `nuqs` with hand-rolled implementations.

## Folder Structure Rules (mandatory)

Paths use the `@/*` alias mapped to the **repository root** (`tsconfig.json` → `"@/*": ["./*"]`). There is **no `src/` folder**. Always import via `@/...`, never with relative paths that cross a domain boundary or traverse more than one level up (`../../`).

| Folder | Purpose |
|---|---|
| `app/` | Next.js routes only — `page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`, plus `manifest.ts`, `robots.ts`, `sitemap.ts`. No business logic. `loading.tsx` is **forbidden** (see "Instant Shell & Streaming"). |
| `app/(client)/` | Public storefront routes (Italian-facing). |
| `app/(admin)/` | Admin panel routes (Ukrainian UI), gated by session. |
| `app/actions/` | Server actions, grouped by domain (`product`, `orders`, `brands`, `bundles`, `category`, `payments`, …). Each file starts with `"use server"`. |
| `app/actions/admin/` | Admin-only action entrypoints — see `docs/admin-actions.md`. Public UI must never import from here. |
| `app/api/` | Route handlers — only where a server action cannot serve the need (`auth/[...all]`, webhooks, migrations endpoint). Do not add API routes for things server actions already cover. |
| `db/` | `db.ts` (MySQL pool + Drizzle client) and `db/schemas/`. |
| `db/schemas/` | Drizzle schema files, one domain per file, named `*.schema.ts`. |
| `lib/` | Framework-agnostic server logic and integrations: `auth.ts`, `catalog/`, `image/`, `seo/`, `mail-transporter.ts`, `paypal.ts`, `klarna.ts`, `s3-files.ts`. |
| `layout-components/` | Global shell: `Header/`, `Footer.tsx`. |
| `components/` | Shared React components used across pages. |
| `store/` | Zustand client stores (`basket-store.ts`, `checkout-store.ts`, …). |
| `types/` | Shared TS types and constants, incl. `cache-trigers.constant.ts` (the single source of cache tags). |
| `utils/` | Pure, framework-agnostic helpers (formatters, slug parsing, totals). No DB, no UI. |

### Naming conventions

- **React components**: `PascalCase.tsx` (e.g. `ProductCard`, `SmartImage.tsx`).
- **Actions, utilities, schemas, lib files**: `kebab-case` (e.g. `get-product-by-slug.ts`, `product.schema.ts`, `mail-transporter.ts`).
- **Drizzle schema files**: `*.schema.ts`. **Type files**: `*.types.ts`. **Test files**: `*.test.ts`, co-located with the file under test.
- Functions: reads `get* / list* / find*`, mutations `create* / update* / delete*`, cached cores `*CachedCore`. Admin reads gradually take the `Admin` suffix (`getAllProductsAdmin`).

### Anti-patterns (forbidden)

- Business logic (DB queries, auth checks) in `app/` route or `page.tsx` files.
- UI components in `lib/` or `utils/`.
- Relative imports across domains or `../../` traversal — use `@/`.
- Importing UI-facing types from a `"use server"` module — keep shared types in `*.types.ts` or schema-derived types.
- Generic catch-all filenames (`utils.ts`, `helpers.ts`, `common.ts`, barrel `index.ts` re-exports for schemas).

## Senior Engineering Standard

**Write code like a senior.** Highest-priority engineering rule.

- **Solve the exact problem. Nothing more.** No speculative abstractions, no defensive code for impossible states.
- **Name things for what they ARE.** `getProductBySlug`, not `fetchData`. `isHidden`, not `hiddenFlag`.
- **One function, one responsibility.** If the description needs "and", split it.
- **Guard clauses over nesting.** Return early on invalid input.
- **Error handling at boundaries.** Validate user input and external API/payment responses; do not wrap pure helpers in pointless try/catch.
- **Error paths as clean as happy paths.** Failures are explicit, typed, and returned — never swallowed, never logged-and-ignored.
- **State minimized and explicit.** Derived values are computed, not stored. `useState` for UI interaction only.
- **Composition over duplication.** Two similar blocks → leave them; the third → extract.
- **No giant files.** Target ~150 lines per file/component; anything over 300 lines MUST be split (review blocker). One file = one zone of responsibility.
- **Orchestrators compose, leaves work.** Pages and section components are thin orchestrators; a component that loads data does only that and renders its own fragment (`docs/code-style-rules.md` §18).
- **No custom solutions.** Before implementing any pattern, follow the library's official documentation (for Next.js — the bundled docs in `node_modules/next/dist/docs/`). Never invent an alternative to a documented API.
- **Read before touching.** Read the relevant section before editing an existing file. If the existing implementation is correct, leave it exactly as is — do not rewrite working code just because you are in the file.

React Compiler is enabled (`reactCompiler: true`). Do **not** add `useMemo` / `useCallback` for routine render optimization — only when a documented library contract requires stable identity or a measured exception is recorded.

## Server Actions & Caching (this project's core pattern)

Full rules in `docs/code-style-rules.md` (sections 3–10). Summary:

- Every server-action file begins with `"use server"` and returns a **stable, typed contract** — `{ success, data, errorCode, errorMessage }` shape, never a raw value or a thrown internal error.
- **Reads** that can tolerate caching use the cached-core pattern: an inner `*CachedCore()` containing `"use cache"` + `cacheTag(...)` + `cacheLife(...)`, wrapped by an outer function that does input validation and `try/catch` with a safe fallback. Never put the fallback-returning `try/catch` inside the `"use cache"` function — errors must not be cached.
- In wrappers around cached reads that run during render/prerender, call `unstable_rethrow(error)` before custom error handling (lets `redirect`/`notFound`/PPR control-flow errors through). See `utils/guard-build.ts` `isBuildPhase()` for the build-phase guard.
- **`cacheTag`** strings come only from `CACHE_TAGS` in `types/cache-trigers.constant.ts`. Never hardcode tag strings.
- **`cacheLife`** profile by volatility: `seconds` (cart, payment, live admin lists), `minutes` (catalog: products, brands, categories, filters), `hours` (external/static, e.g. Google reviews).
- **No mutation without `updateTag`.** After every create/update/delete, invalidate the list tag, the changed entity's detail tag, and any derived tags (filters, top-sales, gallery). If a slug changed, invalidate both old and new. Run DB writes first, then `updateTag`.
- Public catalog reads default to `includeHidden: false`; admin reads pass `includeHidden: true` explicitly. (Setting a product `isHidden` removes it from the storefront but keeps it editable in admin — distinct from quantity `0`, which keeps it on-site as "IN ARRIVO".)

## Types — Schemas Are the Single Source of Truth

Every type that touches a DB table derives from the Drizzle schema — never hand-written:

- Entity types: `typeof productsSchema.$inferSelect` (e.g. `ProductType`).
- Insert/update inputs: `$inferInsert` or `drizzle-zod` schemas narrowed with `.pick()` / `.omit()` / `.extend()`.
- Joined / projected UI types: built with `Pick` / `Omit` / intersections on inferred bases — never re-list column names.

```ts
// ✅ entity type from schema
import { ProductType, productsSchema } from "@/db/schemas/product.schema";

// ❌ parallel hand-written interface duplicating columns
interface Product { id: string; slug: string; price: number }
```

## Database Rules

- DB is **MySQL** accessed through a shared `mysql2` pool in `db/db.ts` and the Drizzle adapter. Better Auth uses the same adapter with `provider: "mysql"` and the generated `auth-schema.ts`.
- App-owned schemas live in `db/schemas/*.schema.ts`, one domain per file. Import the concrete schema module where needed — no manual barrel re-exports.
- **Migrations are NOT run in this workflow.** Do not run Drizzle Kit generate/migrate and do not apply SQL automatically. You may prepare schema edits in code; the project owner generates and applies migrations manually. (`docs/code-style-rules.md` §13.)
- Whenever code introduces or requires an environment variable, add it to `.env.example` in the same change.

## Authentication & Access Control

- Auth is **Better Auth** (`admin` plugin). Use its exports directly (`betterAuth`, `admin`, `createAuthClient`, `adminClient`); do not wrap capabilities it already provides. Keep `auth-schema.ts` as generated by the Better Auth CLI — do not hand-maintain it.
- **Every admin action enforces access via `requireAdminSession()`** (`app/actions/admin/_shared/require-admin-session.ts`).
- `proxy.ts` (matcher `/admin/:path*`) is only a lightweight session-cookie gate — **not** the real authorization layer. Real authorization happens inside server actions, pages, layouts, and routes.
- **Customer accounts are specified in `docs/specs/client-accounts/`** (start at `00-overview.md`) — that spec is binding; do not improvise customer-auth behavior outside it.

## UX/UI Standard — Design Before You Code

UX/UI quality is a first-class requirement. Before any new screen/component, visualize it in the browser:

- Where does the eye land first? Is the hierarchy clear? Is there redundant chrome?
- Does it work at 375 px (mobile) and 1440 px (desktop) with no horizontal scroll or clipped content?

**Async button pending state — mandatory for every button that triggers a request/mutation/submit.** Three rules together:
1. **Disabled while pending** (`disabled={isPending}`) — no duplicate submissions.
2. **No hover while pending** — add `disabled:pointer-events-none disabled:opacity-60` alongside any `hover:*`.
3. **Always a visible loader** — render a spinner (`@/components/Spiner` or an icon swap) inside the button while pending. A dimmed button with no spinner is not acceptable.

Applies to all variants, including icon-only (swap the icon for the spinner, keep `aria-label`). Bring existing buttons into compliance when you touch them.

**Animation — tasteful, purposeful, restrained.** `framer-motion` is available for richer entrance/exit/state motion; Tailwind `animate-spin` / `animate-pulse` cover spinners and skeletons. Short durations (~150–250 ms), animate transform/opacity (not layout), respect `prefers-reduced-motion`, never block interaction. No looping or attention-seeking motion outside genuine loading states.

## Instant Shell & Streaming Pattern (mandatory)

**Goal: every navigation instantly returns the page structure. The static shell renders immediately; only the small data-dependent islands stream in.**

This project runs `cacheComponents: true`: prerendering automatically extracts each page's static HTML shell, and any uncached/runtime data access must live under a `<Suspense>` boundary (see `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`). Build on that model — do not fight it:

- **`loading.tsx` is forbidden.** A route-level `loading.tsx` replaces the whole content area with a single fallback and hides the static structure the user should see instantly. Two legacy files remain (`app/(client)/carrello/loading.tsx`, `app/(admin)/admin/dashboard/loading.tsx`) — their migration is `docs/to-do.md` #21; never add new ones.
- `page.tsx` is a thin **orchestrator**: it returns the static structure (headings, layout, navigation, static copy) immediately and composes small data components. It awaits only what is truly blocking (a 404 check, `searchParams` parsing).
- Every piece of UI that depends on the DB or session is a **small async Server Component that fetches its own data**, wrapped in `<Suspense>` at its own boundary. For client interactivity, pass a non-awaited `Promise<T>` prop and read it with `use()` under `<Suspense>` (`docs/code-style-rules.md` §15).
- Every `<Suspense>` fallback is a structured skeleton matching the island's shape — never a bare spinner or grey block where structured content is expected.

Granularity and file-size rules: `docs/code-style-rules.md` §18.

## Error Handling — Prefer Next.js Native

| Situation | Preferred approach |
|---|---|
| Expected data failure (not found, DB error, empty) | Typed read wrapper returning `{ success: false, errorCode, ... }` |
| Unhandled render error in a route segment | `error.tsx` co-located with the segment |
| Page area that can fail independently and is `searchParams`-driven | Split into its own route segment/slot with its own `error.tsx`; its data islands keep their `<Suspense>` skeletons |
| Server action / payment / external API error | Return a typed result — never throw raw errors to the UI |

`error.tsx` is the last-resort net for unexpected render failures; it does not replace typed read wrappers (`docs/code-style-rules.md` §16).

## Languages & Encoding

- **Public storefront content: Italian** (target market). **Admin panel UI: Ukrainian.**
- Before finishing any task, verify there is **no mojibake / encoding corruption** in changed files. Required check:
  `rg -n "Р [РЂ-Уї]{1,2}Р [РЂ-Уї]|[ГђГ‘][A-Za-z]|пїЅ" <changed-files>`

## Quality Gates

- `npm run lint` — ESLint (flat config, Next core-web-vitals + TS + Prettier).
- `npm test` — Vitest. Every `*.actions`/server-action file with non-trivial validation or pure logic gets a co-located `*.test.ts` in the same change set. Test Zod/`safeParse` validation, permission/guard logic, and pure helpers (filters, transforms, totals). Do not unit-test real DB calls or Better Auth internals.
- `npm run build` — must pass; a failing build is a broken store.

Do not introduce new hardcoded cache-tag strings, untyped action returns, or `any`. Keep `strict` TypeScript.
