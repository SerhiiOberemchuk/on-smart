import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Backport: https://github.com/vercel/next.js/pull/97476
// Fail closed on dependency upgrades: review/remove the patch deliberately.
const nextDirectory = "node_modules/next";
const version = JSON.parse(readFileSync(join(nextDirectory, "package.json"), "utf8")).version;
assert.equal(version, "16.3.4", "Review the Next cache cleanup backport before upgrading Next.");

const cleanup =
  /clearTimeout\(timer\);\s+const didTimeout = timeoutAbortController\.signal\.aborted;\s+if \(dynamicAccessAbortSignal\) \{\s+\/\/ Release React's listener from the composite signal\.\s+timeoutAbortController\.abort\(\);\s+\}\s+if \(didTimeout\)/;

for (const prefix of ["", "esm/"]) {
  const relativePath = `dist/${prefix}server/use-cache/use-cache-wrapper.js`;
  const source = readFileSync(join(nextDirectory, relativePath), "utf8");
  assert.match(source, cleanup, `Missing Next cache cleanup in ${relativePath}. Run npm ci.`);
}

const standaloneRoot = process.argv[2];
if (standaloneRoot) {
  const relativePath = join(nextDirectory, "dist/server/use-cache/use-cache-wrapper.js");
  assert.equal(
    readFileSync(join(standaloneRoot, relativePath), "utf8"),
    readFileSync(relativePath, "utf8"),
    "Standalone Next cache wrapper differs from the patched dependency. Rebuild before deployment.",
  );
}

console.log(
  `[next-cache-patch] Verified Next ${version}${standaloneRoot ? " and standalone" : " (CJS + ESM)"}.`,
);
