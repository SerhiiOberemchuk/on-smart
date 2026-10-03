import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type CacheEntry = { isStale: boolean | -1 } | undefined;
type ShouldRevalidate = (entry: CacheEntry, isPossibleServerAction: boolean) => unknown;

// Execute the stale-entry condition from the installed framework, not a copy of
// the fix (vercel/next.js#99564, patches/next+16.3.8.patch).
function getInstalledCondition(moduleFormat: "commonjs" | "esm"): ShouldRevalidate {
  const prefix = moduleFormat === "esm" ? "esm/" : "";
  const source = readFileSync(
    `node_modules/next/dist/${prefix}build/templates/app-page-runtime.js`,
    "utf8",
  );
  const marker = source.indexOf("We want to trigger this flow if the cache entry is stale");
  const start = source.lastIndexOf("if (incrementalCacheEntry &&", marker);
  const branch = source
    .slice(start)
    .match(/^if \(([\s\S]*?)\) \{\s*\/\/ We want to schedule this on the next tick/);
  if (marker === -1 || !branch) {
    throw new Error("Next stale revalidation branch changed; review the backport.");
  }

  return new Function(
    "incrementalCacheEntry",
    "isPossibleServerAction",
    `return (${branch[1]});`,
  ) as ShouldRevalidate;
}

describe.each(["commonjs", "esm"] as const)(
  "Next stale-shell revalidation (%s)",
  (moduleFormat) => {
    const shouldRevalidate = getInstalledCondition(moduleFormat);

    it("does not revalidate in the background for a server action", () => {
      expect(shouldRevalidate({ isStale: true }, true)).toBe(false);
      expect(shouldRevalidate({ isStale: -1 }, true)).toBe(false);
    });

    it("still revalidates a stale shell for a navigation", () => {
      expect(shouldRevalidate({ isStale: true }, false)).toBe(true);
      expect(shouldRevalidate({ isStale: -1 }, false)).toBe(true);
    });

    it("leaves a fresh shell alone", () => {
      expect(shouldRevalidate({ isStale: false }, false)).toBe(false);
      expect(shouldRevalidate(undefined, false)).toBeFalsy();
    });
  },
);
