"use server";

import { isBuildPhase } from "@/utils/guard-build";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { cacheLife, cacheTag } from "next/cache";

const TAG = "test.brands.all";
const RETRY_OPTIONS = { tries: 10, delayMs: 1000, linearBackoffMs: 250 } as const;
const BUILD_PHASE_MARK = "build-phase";

type CachedCountPayload = {
  count: number;
  cachedAt: string;
  attempts: number;
};

type CachedCatchPayload = {
  ok: boolean;
  count: number | null;
  error: string | null;
  cachedAt: string;
  attempts: number;
};

type CachedGuardInsidePayload = {
  count: number | null;
  error: string | null;
  cachedAt: string;
  attempts: number;
  skippedInBuild: boolean;
};

export type StrategyResult = {
  strategy: string;
  ok: boolean;
  count: number | null;
  buildPhase: boolean;
  error: string | null;
  tookMs: number;
  checkedAt: string | null;
  cachedAt: string | null;
  attempts: number;
  note: string | null;
};

function buildPhaseSkip(strategy: string, note: string): StrategyResult {
  return {
    strategy,
    ok: true,
    count: null,
    buildPhase: true,
    error: "skipped: build phase",
    tookMs: 0,
    checkedAt: BUILD_PHASE_MARK,
    cachedAt: null,
    attempts: 0,
    note,
  };
}

async function measure<T>(fn: () => Promise<T>) {
  const startedAt = performance.now();

  try {
    const data = await fn();
    return {
      ok: true as const,
      data,
      error: null as string | null,
      tookMs: Math.round(performance.now() - startedAt),
    };
  } catch (e) {
    return {
      ok: false as const,
      data: null as unknown as T,
      error: e instanceof Error ? e.message : String(e),
      tookMs: Math.round(performance.now() - startedAt),
    };
  }
}

async function fetchBrandsCountOnce() {
  const rows = await db.select().from(brandProductsSchema);
  return rows.length;
}

export async function brands_noCache_throw(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("noCache_throw", "Build-safe skip before DB call");
  }
  let attempts = 0;

  const r = await measure(async () => {
    attempts = 1;
    return fetchBrandsCountOnce();
  });

  return {
    strategy: "noCache_throw",
    ok: r.ok,
    count: r.ok ? (r.data as number) : null,
    buildPhase,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: buildPhase ? BUILD_PHASE_MARK : "after-no-cache-call",
    cachedAt: null,
    attempts,
    note: "No cache, no retry",
  };
}

export async function brands_noCache_retryThrow(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("noCache_retryThrow", "Build-safe skip before DB call");
  }
  let attempts = 0;

  const r = await measure(async () => {
    return withRetrySelective(
      async () => {
        attempts += 1;
        return fetchBrandsCountOnce();
      },
      RETRY_OPTIONS,
    );
  });

  return {
    strategy: "noCache_retryThrow",
    ok: r.ok,
    count: r.ok ? (r.data as number) : null,
    buildPhase,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: buildPhase ? BUILD_PHASE_MARK : "after-no-cache-retry-call",
    cachedAt: null,
    attempts,
    note: "No cache, with retry",
  };
}

async function brands_cached_count(): Promise<CachedCountPayload> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");

  return {
    count: await fetchBrandsCountOnce(),
    cachedAt: new Date().toISOString(),
    attempts: 1,
  };
}

export async function brands_cache_throw(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("cache_throw", "Build-safe skip before cached DB call");
  }
  const r = await measure(() => brands_cached_count());

  return {
    strategy: "cache_throw",
    ok: r.ok,
    count: r.ok ? (r.data as CachedCountPayload).count : null,
    buildPhase,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    cachedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    attempts: r.ok ? (r.data as CachedCountPayload).attempts : 0,
    note: "Cache enabled, throw on error",
  };
}

async function brands_cached_retry_count(): Promise<CachedCountPayload> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");

  let attempts = 0;
  const count = await withRetrySelective(
    async () => {
      attempts += 1;
      return fetchBrandsCountOnce();
    },
    RETRY_OPTIONS,
  );

  return {
    count,
    cachedAt: new Date().toISOString(),
    attempts,
  };
}

export async function brands_cache_retryThrow(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("cache_retryThrow", "Build-safe skip before cached DB call");
  }
  const r = await measure(() => brands_cached_retry_count());

  return {
    strategy: "cache_retryThrow",
    ok: r.ok,
    count: r.ok ? (r.data as CachedCountPayload).count : null,
    buildPhase,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    cachedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    attempts: r.ok ? (r.data as CachedCountPayload).attempts : 0,
    note: "Cache enabled, retry before throw",
  };
}

export async function brands_guardOutsideCache(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();

  if (buildPhase) {
    return buildPhaseSkip("guard_outside_cache", "Guard is outside cache");
  }

  const r = await measure(() => brands_cached_count());

  return {
    strategy: "guard_outside_cache",
    ok: r.ok,
    count: r.ok ? (r.data as CachedCountPayload).count : null,
    buildPhase: false,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    cachedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    attempts: r.ok ? (r.data as CachedCountPayload).attempts : 0,
    note: "Guard is outside cache",
  };
}

export async function brands_guardOutsideCache_retryThrow(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();

  if (buildPhase) {
    return buildPhaseSkip("guard_outside_cache_retryThrow", "Recommended for build without DB");
  }

  const r = await measure(() => brands_cached_retry_count());

  return {
    strategy: "guard_outside_cache_retryThrow",
    ok: r.ok,
    count: r.ok ? (r.data as CachedCountPayload).count : null,
    buildPhase: false,
    error: r.error,
    tookMs: r.tookMs,
    checkedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    cachedAt: r.ok ? (r.data as CachedCountPayload).cachedAt : null,
    attempts: r.ok ? (r.data as CachedCountPayload).attempts : 0,
    note: "Recommended for build without DB",
  };
}

async function brands_cached_guardInside(): Promise<CachedGuardInsidePayload> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");

  if (isBuildPhase()) {
    return {
      count: null,
      error: "skipped: build phase (inside cache)",
      cachedAt: new Date().toISOString(),
      attempts: 0,
      skippedInBuild: true,
    };
  }

  return {
    count: await fetchBrandsCountOnce(),
    error: null,
    cachedAt: new Date().toISOString(),
    attempts: 1,
    skippedInBuild: false,
  };
}

export async function brands_guardInsideCache(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("guard_inside_cache", "Build-safe skip before cached function");
  }
  const r = await measure(() => brands_cached_guardInside());

  if (!r.ok) {
    return {
      strategy: "guard_inside_cache",
      ok: false,
      count: null,
      buildPhase,
      error: r.error,
      tookMs: r.tookMs,
      checkedAt: buildPhase ? BUILD_PHASE_MARK : null,
      cachedAt: null,
      attempts: 0,
      note: "Unexpected wrapper failure",
    };
  }

  const payload = r.data as CachedGuardInsidePayload;

  return {
    strategy: "guard_inside_cache",
    ok: true,
    count: payload.count,
    buildPhase,
    error: payload.error,
    tookMs: r.tookMs,
    checkedAt: payload.cachedAt,
    cachedAt: payload.cachedAt,
    attempts: payload.attempts,
    note: "Anti-pattern: guard is inside cached function",
  };
}

async function brands_cached_retry_catchReturn(): Promise<CachedCatchPayload> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");

  let attempts = 0;

  try {
    const count = await withRetrySelective(
      async () => {
        attempts += 1;
        return fetchBrandsCountOnce();
      },
      RETRY_OPTIONS,
    );

    return {
      ok: true,
      count,
      error: null,
      cachedAt: new Date().toISOString(),
      attempts,
    };
  } catch (e) {
    return {
      ok: false,
      count: null,
      error: e instanceof Error ? e.message : String(e),
      cachedAt: new Date().toISOString(),
      attempts,
    };
  }
}

export async function brands_cache_catchReturn(): Promise<StrategyResult> {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return buildPhaseSkip("cache_catchReturn", "Build-safe skip before cached function");
  }
  const r = await measure(() => brands_cached_retry_catchReturn());

  if (!r.ok) {
    return {
      strategy: "cache_catchReturn",
      ok: false,
      count: null,
      buildPhase,
      error: r.error,
      tookMs: r.tookMs,
      checkedAt: buildPhase ? BUILD_PHASE_MARK : null,
      cachedAt: null,
      attempts: 0,
      note: "Unexpected wrapper failure",
    };
  }

  const payload = r.data as CachedCatchPayload;

  return {
    strategy: "cache_catchReturn",
    ok: payload.ok,
    count: payload.count,
    buildPhase,
    error: payload.error,
    tookMs: r.tookMs,
    checkedAt: payload.cachedAt,
    cachedAt: payload.cachedAt,
    attempts: payload.attempts,
    note: "Anti-pattern: caches failure payload",
  };
}
