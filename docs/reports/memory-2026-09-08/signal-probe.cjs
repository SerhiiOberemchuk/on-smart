/* eslint-disable @typescript-eslint/no-require-imports -- This isolated probe needs CommonJS cache aliases to match Next's vendored React runtime. */
// Isolated diagnostic; never imported by the application.
// Run: node --expose-gc --conditions=react-server signal-probe.cjs
// Uses the installed production React Flight implementation, with no HTTP/DB calls.
process.env.NODE_ENV = "production";

const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getEventListeners } = require("node:events");
const { setImmediate: nextTurn } = require("node:timers/promises");
// Match the experimental React aliases Next uses with Cache Components.
require("react");
require("react-dom");
require.cache[
  require.resolve("react")
].exports = require("next/dist/compiled/react-experimental/react.react-server.js");
require("next/dist/compiled/react-experimental");
require.cache[require.resolve("next/dist/compiled/react-experimental")].exports = require("react");
require.cache[
  require.resolve("react-dom")
].exports = require("next/dist/compiled/react-dom-experimental/react-dom.react-server.js");
const {
  prerender,
} = require("next/dist/compiled/react-server-dom-turbopack-experimental/static.edge");

async function fillBatch(cleanup) {
  const hash = createHash("sha256");
  const sources = [];
  const signals = [];
  let listenersAfterRender = 0;
  let bytes = 0;
  for (let i = 0; i < 100; i++) {
    const dynamicAccess = new AbortController();
    const timeout = new AbortController();
    // Keep source controllers reachable in both batches to isolate listener retention.
    sources.push(dynamicAccess, timeout);
    const composite = AbortSignal.any([dynamicAccess.signal, timeout.signal]);
    signals.push(new WeakRef(composite));
    const { prelude } = await prerender(
      { sample: i, payload: "x".repeat(8192) },
      {},
      {
        signal: composite,
        environmentName: "Cache",
      },
    );
    const didTimeout = timeout.signal.aborted;
    if (cleanup) timeout.abort();
    assert.equal(didTimeout, false);
    for await (const chunk of prelude) {
      bytes += chunk.byteLength;
      hash.update(chunk);
    }
    listenersAfterRender += getEventListeners(composite, "abort").length;
  }
  return { sources, signals, listenersAfterRender, bytes, sha256: hash.digest("hex") };
}

async function runBatch(cleanup) {
  const { sources, signals, listenersAfterRender, bytes, sha256 } = await fillBatch(cleanup);
  // Leave the producer frame before GC so its last local signal is not a root.
  // WeakRefs cannot be collected in the job in which they were created/read.
  for (let i = 0; i < 8; i++) {
    await nextTurn();
    global.gc();
  }
  const retained = signals.filter((ref) => ref.deref() !== undefined).length;
  assert.equal(sources.length, 200);
  return { cleanup, rendered: signals.length, retained, listenersAfterRender, bytes, sha256 };
}

(async () => {
  assert.equal(typeof global.gc, "function", "Run with --expose-gc");
  const current = await runBatch(false);
  const upstreamCleanup = await runBatch(true);
  console.log(
    JSON.stringify(
      {
        node: process.version,
        next: require("next/package.json").version,
        platform: process.platform,
        current,
        upstreamCleanup,
      },
      null,
      2,
    ),
  );
  assert.equal(current.retained, 100);
  assert.equal(upstreamCleanup.retained, 0);
  assert.equal(current.bytes, upstreamCleanup.bytes);
  assert.equal(current.sha256, upstreamCleanup.sha256);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
