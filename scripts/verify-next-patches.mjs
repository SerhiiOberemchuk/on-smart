import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Upgrades must preserve the memory cleanup and the separate prerender pipeline.
const REVIEWED_NEXT_VERSION = "16.4.0";
const nextDirectory = "node_modules/next";
const version = JSON.parse(readFileSync(join(nextDirectory, "package.json"), "utf8")).version;
assert.equal(
  version,
  REVIEWED_NEXT_VERSION,
  "Next changed: review memory cleanup and action isolation.",
);

const cacheCleanup =
  /clearTimeout\(timer\);\s+const didTimeout = timeoutAbortController\.signal\.aborted;\s+if \(dynamicAccessAbortSignal\) \{\s+\/\/ Release React's listener from the composite signal\.\s+timeoutAbortController\.abort\(\);\s+\}\s+if \(didTimeout\)/;

for (const prefix of ["", "esm/"]) {
  const source = (path) => readFileSync(join(nextDirectory, `dist/${prefix}${path}.js`), "utf8");
  assert.match(
    source("server/use-cache/use-cache-wrapper"),
    cacheCleanup,
    "Missing cache cleanup.",
  );
  const template = source("build/templates/app-page-runtime");
  assert.match(
    template,
    /const isRequestSpecificRender = !forceStaticRender && !isDebugPrerender && \(supportsDynamicResponse \|\| isPossibleServerAction\);/,
  );
  assert.match(
    template,
    /renderOperation === 'prerender' \? routeModule\.prerender\(nextReq, nextRes, context\) : routeModule\.render\(nextReq, nextRes, context\)/,
  );
  const render = source("server/app-render/app-render");
  const prerender = render.slice(
    render.indexOf("async function prerenderAppPage("),
    render.indexOf("async function renderAppPage("),
  );
  assert.ok(prerender.includes("prerenderToStreamWithTracing"), "Missing dedicated prerender.");
  assert.ok(!prerender.includes("handleAction"), "Prerender must not execute Server Actions.");
}

const standaloneRoot = process.argv[2];
if (standaloneRoot) {
  const relativePath = join(nextDirectory, "dist/server/use-cache/use-cache-wrapper.js");
  assert.equal(
    readFileSync(join(standaloneRoot, relativePath), "utf8"),
    readFileSync(relativePath, "utf8"),
    "Standalone cache wrapper differs from the installed dependency.",
  );
  const chunksDirectory = join(standaloneRoot, ".next/server/chunks");
  const dispatch =
    /(?:["']prerender["']===([\w$]+)|([\w$]+)===["']prerender["'])\?([\w$]+)\.prerender\(([^)]*)\):\3\.render\(\4\)/;
  const hasSeparatePipeline = readdirSync(chunksDirectory, { recursive: true }).some((entry) => {
    const file = join(chunksDirectory, String(entry));
    return file.endsWith(".js") && dispatch.test(readFileSync(file, "utf8"));
  });
  assert.ok(hasSeparatePipeline, "Standalone is missing the dedicated prerender dispatch.");
}
console.log(
  `[next-patches] Verified Next ${version}${standaloneRoot ? " and standalone" : " (CJS + ESM)"}.`,
);
