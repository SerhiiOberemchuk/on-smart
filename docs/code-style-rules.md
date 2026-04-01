# Code Style Rules (Next.js 16)

These rules are required for all new code and refactoring in this repository.

## 1. General Rules

- Use TypeScript `strict` mode and avoid `any`.
- Use imports via alias `@/*`.
- Formatting: Prettier (`printWidth: 100`) + `prettier-plugin-tailwindcss`.
- Run `npm run lint` before opening a PR.
- File naming: `kebab-case` for utilities/actions, `PascalCase.tsx` for React components.

## 2. Next.js Components

- Use **Server Components** by default.
- Add `"use client"` only when required:
  - browser APIs;
  - local state/effects;
  - interactive behavior (forms, onClick handlers, animation control).
- Do not move heavy server logic into client components.

## 3. Server Actions

- Keep mutations and server reads in `app/actions/**` or `lib/**` (for shared server logic).
- Every server action file must start with `"use server"`.
- Every action must return a stable typed contract (`success` + `data/error` or equivalent).
- Validate input before database operations.
- Do not mix UI concerns and DB mutations in one component.

## 4. Cache Components / `use cache`

The project already uses `cacheComponents: true` in `next.config.ts`; this is the default standard.

Rules:

- For cacheable reads, use this pattern:
  - internal function named `*CachedCore()`;
  - inside it: `"use cache"`, `cacheTag(...)`, `cacheLife(...)`;
  - outer wrapper with `try/catch`, fallback, and guard logic (for example `isBuildPhase()`).
- Use `"use cache"` only in functions that actually perform cached reads.
- Never use `"use cache"` in mutation actions.
- Never cache errors: only successful, valid data may be returned from cached code paths.
- Never place `try/catch` that returns fallback/error objects inside the same function that contains `"use cache"`.
- Validation that does not depend on DB state (`missing id`, `empty array`, invalid params) must run in the outer wrapper before entering the cached core.
- If a DB/schema error happens, the wrapper may log and return a safe fallback, but that fallback must be produced outside the cached function so it is not persisted in cache.

Recommended template:

```ts
"use server";

import { cacheLife, cacheTag } from "next/cache";

async function getSomethingCachedCore(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.entity.byId(id));

  return dbQuery(id);
}

export async function getSomething(id: string) {
  if (!id) {
    return fallback;
  }

  try {
    return await getSomethingCachedCore(id);
  } catch (error) {
    console.error("[getSomething]", error);
    return fallback;
  }
}
```

## 5. `cacheLife` TTL Policy

Use semantic profiles (`"seconds" | "minutes" | "hours"`) based on data volatility:

- `seconds`: highly dynamic data (cart, payment state, real-time admin lists).
- `minutes`: catalog reads (products, brands, categories, filters).
- `hours`: external or mostly static integrations (for example Google reviews).

If unsure, start with `minutes`.

## 6. `cacheTag` Tagging Rules

- Use tags only from `types/cache-trigers.constant.ts` via `CACHE_TAGS`.
- Do not hardcode tag strings in action files.
- For list + detail scenarios, apply both tags when the query affects both.
  - example: `product.all` + `product.bySlug(slug)`.
- For composite responses, include tags for all dependent entities.

## 7. `updateTag` Invalidation Rules

After every `create/update/delete`, call `updateTag(...)` for:

- entity list tag;
- changed entity detail tag (`byId`, `bySlug`);
- derived tags (filters, topSales, details, gallery) when affected.

Minimum rule: **no mutation without `updateTag`**.

Recommended template:

```ts
"use server";

import { updateTag } from "next/cache";

export async function updateEntity(input: Input) {
  // 1) read existing state if needed (old slug, relations)
  // 2) write to DB
  // 3) invalidate all affected tags
  updateTag(CACHE_TAGS.entity.all);
  updateTag(CACHE_TAGS.entity.byId(input.id));
}
```

## 8. Transaction Order

- Run all DB operations/transaction first.
- Call `updateTag` only after successful mutation.
- If keys changed (for example old/new slug), invalidate both.

## 9. Error Handling and Logging

- Do not cache error states or failed responses.
- If the function returns `{ success: false }`, `null`, `[]`, or any other fallback after a DB failure, that return path must stay outside `"use cache"`.
- In cached wrappers, return a safe fallback (`[]`/`null`) where appropriate.
- Log technical errors with context (`[featureName] ...`).
- Do not pass raw errors to UI without normalization.
- Do not expose `error: unknown` in stable UI-facing contracts when a typed error shape is practical.
- Prefer explicit error fields such as `errorCode` and `errorMessage` over raw error objects in returned results.
- Recommended read error codes: `"INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR"`; extend only when the caller needs a materially different branch.
- Keep raw thrown errors in logs only (`console.error` with context); map them to stable user-safe values before returning.

Recommended typed result shape:

```ts
type ReadResult<T> =
  | {
      success: true;
      data: T;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR";
      errorMessage: string;
    };
```

## 10. Naming Conventions

- Reads: `get*`, `list*`, `find*`.
- Mutations: `create*`, `update*`, `delete*`.
- Internal cache functions: `*CachedCore`.
- Shared cache constants: colocated `cache-tags.ts` or `CACHE_TAGS`.

## 11. Code Review Checklist

- `"use server"` exists in each server-action file.
- For reads: `"use cache"` + `cacheTag` + `cacheLife` are present.
- For mutations: full `updateTag` invalidation is present.
- No new hardcoded cache-tag strings were introduced.
- Action return type is stable and typed.
- No mojibake/encoding corruption in changed files.
  - Required check before finish: `rg -n "Р [РЂ-Уї]{1,2}Р [РЂ-Уї]|[ГђГ‘][A-Za-z]|пїЅ" <changed-files>`

## 12. Languages

- The public website content should be written in Italian (target market requirement).
- The admin panel UI must be written in Ukrainian.
- Before finishing any task, verify there is no mojibake/encoding corruption in changed files.

## 13. Database

- Do not generate or apply migrations in this workflow.
- Do not run Drizzle migration generation commands and do not apply SQL schema changes automatically.
- Schema edits may be prepared in code, but migration generation/execution is done manually by the project owner.

## 14. UI State and Server Actions

- Use `useActionState` when the flow is `form action -> single server action -> single result state`.
- Use `useState`/`useTransition` for multi-step client orchestration (uploads, parallel saves, cross-component events, save-all flows).
- Do not force `useActionState` for complex pages that combine multiple async operations in one UI action.
- Keep async status explicit: `isLoading`, `isUploading`, `isPending` names must reflect real operation scope.

## 15. Server Data Delivery to Client Components

- For admin edit pages, do not load base reference data from client `useEffect` (brands, categories, product lists, etc.).
- Fetch that data in the server page component and pass it as `Promise` props to client components.
- In client components, read these promises with `use()` under `Suspense`.
- This is the default pattern for reducing repeated DB calls, avoiding connection spikes, and keeping data flow predictable.
- Public/product-catalog reads must default to `includeHidden: false`; admin pages must pass `includeHidden: true` explicitly when hidden items are required.

## 16. Route Error Boundaries

- Public route segments with multiple independent async data sources should provide `error.tsx` at the segment level.
- `error.tsx` is the last-resort protection for unexpected render-time failures; it does not replace typed read wrappers.
- Use typed wrappers for expected data failures (`NOT_FOUND`, `DB_ERROR`, empty-state fallback) and `error.tsx` for everything that still escapes.
- Prefer smaller route segments when the page has independently recoverable areas.
- When a page area can fail independently and is driven by `searchParams`, prefer splitting it into a separate route segment or slot so it can own its own `loading.tsx` and `error.tsx`.

Catalog guidance:

- The catalog page is a good candidate for segmented rendering because filters, header/meta counters, and product list are independent read surfaces.
- If the page is split further, each segment must keep search-param-driven behavior deterministic and must not duplicate expensive DB reads unnecessarily.
