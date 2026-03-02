import {
  brands_cache_catchReturn,
  brands_cache_retryThrow,
  brands_cache_throw,
  brands_guardInsideCache,
  brands_guardOutsideCache,
  brands_guardOutsideCache_retryThrow,
  brands_noCache_retryThrow,
  brands_noCache_throw,
  type StrategyResult,
} from "@/app/actions/brands/test-actions-brands";
import { headers } from "next/headers";
import { Suspense } from "react";

const RECOMMENDED_STRATEGY = "guard_outside_cache_retryThrow";
const ANTIPATTERNS = ["guard_inside_cache", "cache_catchReturn"] as const;
const CACHED_STRATEGIES = [
  "cache_throw",
  "cache_retryThrow",
  "guard_outside_cache",
  "guard_outside_cache_retryThrow",
  "guard_inside_cache",
  "cache_catchReturn",
] as const;

function toMap(results: StrategyResult[]) {
  return Object.fromEntries(results.map((item) => [item.strategy, item])) as Record<string, StrategyResult>;
}

function buildVerdict(firstOpen: StrategyResult[], sameRequestReplay: StrategyResult[]) {
  const firstMap = toMap(firstOpen);
  const replayMap = toMap(sameRequestReplay);
  const recommended = firstMap[RECOMMENDED_STRATEGY];
  const allBuildPhase = firstOpen.every((item) => item.buildPhase);
  const allChecks = [...firstOpen, ...sameRequestReplay];
  const failedStrategies = Array.from(
    new Set(allChecks.filter((item) => !item.ok || item.error !== null).map((item) => item.strategy)),
  );

  return {
    executionContext: allBuildPhase ? "build-phase snapshot (runtime DB not tested)" : "runtime request",
    readyForRuntimeDecision: !allBuildPhase,
    failurePathTested: failedStrategies.length > 0,
    failurePathStrategies: failedStrategies,
    recommendedStrategy: RECOMMENDED_STRATEGY,
    recommendedNow: {
      ok: recommended?.ok ?? false,
      error: recommended?.error ?? null,
      tookMs: recommended?.tookMs ?? null,
      attempts: recommended?.attempts ?? null,
      cachedAt: recommended?.cachedAt ?? null,
      note: recommended?.note ?? null,
    },
    antiPatternsNow: ANTIPATTERNS.map((strategy) => {
      const item = firstMap[strategy];
      return {
        strategy,
        ok: item?.ok ?? false,
        error: item?.error ?? null,
        cachedAt: item?.cachedAt ?? null,
        note: item?.note ?? null,
      };
    }),
    sameRequestReplayCheck: CACHED_STRATEGIES.map((strategy) => {
      const first = firstMap[strategy];
      const replay = replayMap[strategy];

      return {
        strategy,
        firstOk: first?.ok ?? false,
        replayOk: replay?.ok ?? false,
        firstCachedAt: first?.cachedAt ?? null,
        replayCachedAt: replay?.cachedAt ?? null,
        sameCachedPayloadInSingleRequest:
          Boolean(first?.cachedAt) && Boolean(replay?.cachedAt) && first?.cachedAt === replay?.cachedAt,
        firstTookMs: first?.tookMs ?? null,
        replayTookMs: replay?.tookMs ?? null,
      };
    }),
  };
}

async function ResultsPre() {
  // Mark this subtree as request-dependent, so tests run at runtime instead of only at build.
  await headers();

  const firstOpen = await Promise.all([
    brands_noCache_throw(),
    brands_noCache_retryThrow(),
    brands_cache_throw(),
    brands_cache_retryThrow(),
    brands_guardOutsideCache(),
    brands_guardOutsideCache_retryThrow(),
    brands_guardInsideCache(),
    brands_cache_catchReturn(),
  ]);

  const sameRequestReplay = await Promise.all([
    brands_cache_throw(),
    brands_cache_retryThrow(),
    brands_guardOutsideCache(),
    brands_guardOutsideCache_retryThrow(),
    brands_guardInsideCache(),
    brands_cache_catchReturn(),
  ]);

  const verdict = buildVerdict(firstOpen, sameRequestReplay);

  return (
    <pre className="mt-6 overflow-auto rounded-lg bg-black p-4 text-sm text-white">
      {JSON.stringify({ verdict, firstOpen, sameRequestReplay }, null, 2)}
    </pre>
  );
}

export default async function BrandsStrategiesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-xl font-semibold">Brands strategies test</h1>
      <p className="opacity-70">
        Open right after redeploy and after 1-2-5 minutes.
      </p>
      <p className="opacity-70">
        One render now includes: first-open results, same-request replay cache check, and auto verdict.
      </p>
      <Suspense fallback={<p className="mt-6 text-sm opacity-70">Loading...</p>}>
        <ResultsPre />
      </Suspense>
    </div>
  );
}
