import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Fails closed on Next upgrades. Both checks are tied to reviewed framework source:
// 1. use-cache prerender signal cleanup (vercel/next.js#97476, released in 16.3.5
//    as #98448) — the fix for the production memory leak. Must stay present.
// 2. on-smart backport of vercel/next.js#99564 (patches/next+16.3.8.patch) — a
//    server action on a stale PPR shell must not schedule a background
//    revalidation that runs handleAction again on the same request body.
const REVIEWED_NEXT_VERSION = "16.3.8";
const nextDirectory = "node_modules/next";

const version = JSON.parse(readFileSync(join(nextDirectory, "package.json"), "utf8")).version;
assert.equal(
  version,
  REVIEWED_NEXT_VERSION,
  "Next changed: check whether vercel/next.js#99564 is fixed upstream, then update patches/ and this script.",
);

const cacheCleanup =
  /clearTimeout\(timer\);\s+const didTimeout = timeoutAbortController\.signal\.aborted;\s+if \(dynamicAccessAbortSignal\) \{\s+\/\/ Release React's listener from the composite signal\.\s+timeoutAbortController\.abort\(\);\s+\}\s+if \(didTimeout\)/;
const staleActionGuard =
  /!isPossibleServerAction && \(incrementalCacheEntry\.isStale === -1 \|\| incrementalCacheEntry\.isStale === true\)/;

for (const prefix of ["", "esm/"]) {
  const wrapperPath = `dist/${prefix}server/use-cache/use-cache-wrapper.js`;
  assert.match(
    readFileSync(join(nextDirectory, wrapperPath), "utf8"),
    cacheCleanup,
    `Missing Next cache cleanup in ${wrapperPath}.`,
  );

  const templatePath = `dist/${prefix}build/templates/app-page-runtime.js`;
  assert.match(
    readFileSync(join(nextDirectory, templatePath), "utf8"),
    staleActionGuard,
    `Missing server-action stale revalidation guard in ${templatePath}. Run npm ci.`,
  );
}

// Turbopack bundles the ESM template into a minified server chunk, so check the
// shipped artifact too: every stale-shell revalidation branch must be guarded by
// the variable that holds getIsPossibleServerAction(req).
function assertBundledStaleActionGuard(chunksDirectory) {
  const staleBranch =
    /([\w$]+)&&(?:!([\w$]+)&&)?\(-1===\1\.isStale\|\|!0===\1\.isStale\)&&\(0,[\w$]+\.scheduleOnNextTick\)/g;
  const actionFlag = /([\w$]+)=\(0,[\w$]+\.getIsPossibleServerAction\)\(/g;
  let branchCount = 0;

  for (const entry of readdirSync(chunksDirectory, { recursive: true })) {
    const file = join(chunksDirectory, String(entry));
    if (!file.endsWith(".js")) continue;
    const source = readFileSync(file, "utf8");
    if (!source.includes("scheduleOnNextTick")) continue;

    const flags = new Set([...source.matchAll(actionFlag)].map((match) => match[1]));
    for (const [, , guard] of source.matchAll(staleBranch)) {
      branchCount += 1;
      assert.ok(
        guard && flags.has(guard),
        `Unguarded stale revalidation branch in ${file}. The #99564 patch is missing from the build.`,
      );
    }
  }

  assert.ok(
    branchCount > 0,
    "Stale revalidation branch not found in server chunks; review the patch.",
  );
}

const standaloneRoot = process.argv[2];
if (standaloneRoot) {
  const relativePath = join(nextDirectory, "dist/server/use-cache/use-cache-wrapper.js");
  assert.equal(
    readFileSync(join(standaloneRoot, relativePath), "utf8"),
    readFileSync(relativePath, "utf8"),
    "Standalone Next cache wrapper differs from the installed dependency. Rebuild before deployment.",
  );
  assertBundledStaleActionGuard(join(standaloneRoot, ".next/server/chunks"));
}

console.log(
  `[next-patches] Verified Next ${version}${standaloneRoot ? " and standalone" : " (CJS + ESM)"}.`,
);
