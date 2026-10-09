# Dependency compatibility audit — 2026-10-08

The owner updated all direct dependencies and requested compatibility fixes plus all existing lint errors. The working tree also contains a pre-existing change in `app/actions/product/get-all-products-filtered.ts`; this audit leaves it intact.

## Required database step before deploying Better Auth 1.7.7

**Registration is not deploy-ready until the owner repairs the existing database if migration 0036 was applied or will run during container startup.** Better Auth 1.7.0–1.7.2 required `account.issuer`; 1.7.3 reverted the requirement and stopped writing it. Our old Drizzle schema and migration 0036 made it `NOT NULL` without a default. The first build reproduced Better Auth's diagnostic: “Required columns Better Auth never writes: account.issuer”.

The official [1.7 upgrade guide](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/guides/1-7-upgrade-guide.mdx) and [maintainer explanation](https://better-auth.com/blog/1-7-account-schema) require cleanup before deploying 1.7.3+.

`auth-schema.ts` was regenerated with the **auth 1.7.7 CLI**, using `lib/auth.ts`. It removes the issuer field and preserves the existing table names, lengths, timestamps, admin fields, indexes and relations. No Drizzle migration was generated or applied.

Owner-only preflight against each database:

```sql
SHOW COLUMNS FROM account LIKE 'issuer';
SHOW INDEX FROM account;
SELECT COUNT(*) AS duplicate_groups
FROM (
  SELECT provider_id, account_id
  FROM account
  GROUP BY provider_id, account_id
  HAVING COUNT(*) > 1
) AS duplicates;
```

Back up and test the cleanup on a restored copy. Pause authentication writes during cutover and restart every app instance afterward. Once new issuer-less accounts exist, a package downgrade alone is not a safe rollback.

If `issuer` exists and is required with no default, the official nullable-column repair is:

```sql
ALTER TABLE account MODIFY issuer VARCHAR(255) NULL;
```

If `account_issuer_accountId_uidx` exists, drop it as the guide instructs:

```sql
DROP INDEX account_issuer_accountId_uidx ON account;
```

Migration 0036 in this repository did not create that index; do not run the DROP blindly. Resolve any duplicate provider/account pairs deliberately before rollout. Removing the column entirely is optional later cleanup; drop an issuer index before dropping its column. The owner can generate a migration from the regenerated schema instead, review it and apply it manually. Do not modify historical migration 0036. Startup applies pending migrations: ensure 0036 has run before manual cleanup, or have the owner prepare and review a cleanup migration ordered after 0036. Otherwise a new database or a pending 0036 can recreate the required column at startup.

The read-only check against the configured local database failed with `ECONNREFUSED 127.0.0.1:3306`. Production schema/data were not queried or verified. No migration, registration, email or payment was performed against a live service.

## Next.js 16.4.0

- The original memory fix [#97476](https://github.com/vercel/next.js/pull/97476), shipped in [16.3.5](https://github.com/vercel/next.js/releases/tag/v16.3.5), remains in both installed module formats. Cleanup snapshots `didTimeout` before aborting the composite signal.
- The patch for [#99564](https://github.com/vercel/next.js/issues/99564) is unnecessary in 16.4: forced background work dispatches to `routeModule.prerender`, whose separate implementation never calls `handleAction`. Scheduling revalidation itself can remain enabled for actions. The issue was auto-closed for its reproduction link; that status alone was not used as evidence of a fix.
- Removed `patches/next+16.3.8.patch`, the unused `patch-package` dependency/postinstall, and Docker's patch-directory copy.
- Updated version-pinned pre/postbuild verification, including the standalone cache wrapper and minified prerender dispatch. Regression tests execute installed framework expressions with route-module spies; they do not reproduce an HTTP action against the deployed store.
- Explicit `partialPrefetching: false` preserves this existing application's prefetch behavior; the [bundled adoption guide](../../node_modules/next/dist/docs/01-app/02-guides/adopting-partial-prefetching.md) says adoption changes full-prefetch behavior and needs a separate route audit.
- Node memory sampling now loads via the documented conditional instrumentation import, removing Edge-bundle warnings for `process.memoryUsage`. Its counters have regression coverage.

## Better Auth changes beyond issuer

The [1.7.7 changelog](https://github.com/better-auth/better-auth/blob/v1.7.7/packages/better-auth/CHANGELOG.md) was reviewed across 1.7.3–1.7.7.

- Core and adapter packages are aligned at 1.7.7 in the installed dependency tree.
- 1.7.6 rejects oversized passwords before hashing in more endpoints. Server actions now enforce the configured 128-character maximum and return an Italian input error, including password reset (which previously mislabeled this case as an expired token). Minimum length, email verification, roles and sessions remain the existing contracts.
- 1.7.7 requires coordinated upgrades/new pending flows for Magic Link, OAuth Proxy and OAuth/SAML state. This store uses email/password plus admin and nextCookies; those plugin-specific flows are not configured.
- Runtime schema validation remains enabled. It validates the Drizzle mapping, not whether a migration reached the real database.

## Major and sensitive package review

| Package                                       | Finding for this store                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint 10.12.0                                | Reverted to exact 9.39.5: latest eslint-plugin-react 7.37.5, jsx-a11y 6.10.2 and import 2.32.0 used by Next still declare ESLint 9 as their maximum supported peer. ESLint 9 is itself deprecated/end-of-support; this is a temporary compatibility hold, not a claim that it is the newest release. Deep `npm ls --all` passes after the change.                                   |
| Tailwind/PostCSS 4.3.3 and React types 19.3.0 | Registry checking found these still on older versions after the bulk upgrade. Refreshed within the existing ranges; Tailwind patch release notes cover compiler/selector/preflight corrections. CSS production compilation and TypeScript pass; visual browser comparison was not performed. [Tailwind changelog](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3). |
| Vitest 5.0.3                                  | Existing threads runner and mocks work. Added the root `@/` alias in Vitest config for the new server-action tests.                                                                                                                                                                                                                                                                 |
| Motion 14.0.0                                 | [Changelog](https://github.com/motiondivision/motion/blob/v14.0.0/CHANGELOG.md): removal of internal APIs. No direct Motion imports were found in application code; compile verification passes.                                                                                                                                                                                    |
| Nodemailer 10.0.16                            | [Changelog](https://github.com/nodemailer/nodemailer/blob/v10.0.16/CHANGELOG.md): requires Node 20+, adds ESM/CJS builds and native TS declarations. Docker Node 24.13 and local Node 24.21 satisfy the requirement. Existing createTransport/sendMail usage compiles; offline MIME generation passed. SMTP delivery was not tested.                                                |
| dotenv 18.0.6                                 | [Changelog](https://github.com/motdotla/dotenv/blob/v18.0.6/CHANGELOG.md): removed vault/preload behavior; this project uses the retained config import and Next env loader. Quoted/multiline parser smoke passed. No vault or preload usage found.                                                                                                                                 |
| SumUp SDK 0.2.0                               | Installed official changelog says repeated query parameter names changed. The only SDK call is checkouts.deactivate(id); it remains available. Hosted checkout creation uses the existing REST request. No provider request was sent.                                                                                                                                               |
| PayPal React 10.6.0                           | Installed documentation still supports the V5 entrypoint used here. PayPal V6 migration remains to-do #13. Price/draft reset now follows keyed payment attempts rather than synchronous effect updates. No capture was performed.                                                                                                                                                   |
| React/DOM 19.3.0                              | Versions align, types/build compile. Effect state and ref issues were fixed against React's documented state-adjustment/external-store patterns. New ViewTransition APIs were not adopted.                                                                                                                                                                                          |
| Sharp 0.35.5                                  | Windows native image decode/encode smoke passes. Linux native packages still ship via existing Docker COPY instructions; no Linux image was built or deployed in this task.                                                                                                                                                                                                         |

The [complete direct-package inventory](dependencies-2026-10-08.json) records baseline and installed versions, including unchanged packages.

Other direct upgrades were checked through installed manifests, imports, TypeScript and the production build. This establishes compatibility for compiled usage; it is not a live end-to-end verification of every optional library API.

## Lint repairs and visible behavior

- All 94 existing lint errors are addressed (20 warnings remain) without globally disabling lint rules. Two narrow purity exemptions document already-dynamic Server Components reading time after `connection()`.
- Form state adjusts to changed props during render, instead of synchronous effect updates. Image failures reset when the source changes.
- Cookie consent and persisted admin sidebar collapse use `useSyncExternalStore` with server snapshots; analytics stay consent-gated.
- Async filter loading starts from user interactions; fetching still cleans up stale responses.
- Cart responses no longer repopulate the UI after a newer basket request supersedes them.
- SumUp exposes actual starting/closing state, waits for script readiness, and shows loaders on its request buttons. SDK failure displays Italian recovery text.
- Feedback success messages dismiss after three seconds; each new successful result starts its own timer.
- Database diagnostic serialization uses unknown values with explicit narrowing. JSX entity fixes preserve displayed copy.

## Security audit

Initial npm audit: **22 records: 15 high, 6 moderate, 1 low, 0 critical**.

After removing patch-package and refreshing compatible transitive versions (axios, DOMPurify, fflate, ip-address and brace-expansion): **15 records: 11 high, 4 moderate, 0 low, 0 critical**.

The remaining records are propagation chains from three underlying packages:

- `braces@3.0.3`: [stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The latest published braces version checked was still 3.0.3. Propagates through micromatch/fast-glob to Next's lint plugin and next-sitemap.
- `basic-ftp@5.3.1`: [directory parser advisory](https://github.com/advisories/GHSA-c475-qrg2-pj4r), affects versions through 6.2.0. A fixed 6.2.2 exists, but get-uri 6.0.5 constrains this dependency to 5.x; this chain comes from Apify's proxy support. A forced cross-major override was not applied.
- Old `esbuild@0.18.20` through Drizzle Kit's deprecated esbuild-kit loader: [dev-server advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99). The directly used esbuild remains current. This is tooling, not proof of an exposed production dev server.

The audit's suggested forced fixes include downgrading Next lint configuration, next-sitemap, Apify and Drizzle Kit. Those suggestions were not applied. Audit totals count affected package nodes, not 15 independent exploitable production flaws. The dependency tree is **not vulnerability-free**.

## Validation

Final checks after refreshing Tailwind/PostCSS and React types:

- Clean `npm ci --no-audit --no-fund`: exit 0, no patch-package failure.
- `npm ls --all`: exit 0, no reported dependency problems.
- `npm outdated`: only the intentional ESLint 9 compatibility hold remains; other direct dependencies are current according to the registry check.
- `npm run lint`: exit 0, **0 errors / 20 warnings**. Two warnings are existing React Compiler skips around React Hook Form watch; the rest concern unused declarations/directives.
- `npm test`: **19 files / 77 tests passed** on Vitest 5.
- `npm run build`: exit 0, all 54 pages generated; TypeScript, CSS, installed-source verification and standalone verification passed. The earlier Better Auth schema mismatch, partial-prefetch configuration warning and Edge memoryUsage warning are gone.
- Build-time catalog reads logged `ECONNREFUSED 127.0.0.1:3306` and used existing error handling. This build does not validate real database data or live registration.
- Required encoding scan across all changed/new files: no matches; `git diff --check`: clean.
- Offline Sharp, Nodemailer, dotenv and SumUp API-surface smoke checks passed.

npm also reported five blocked dependency install scripts under the local allowScripts policy; tests, native image smoke and the production build still ran successfully. No script approval policy was changed.

Browser, SMTP, live registration/payment flows, production memory comparison and Docker/Linux validation are outside the evidence obtained here.
