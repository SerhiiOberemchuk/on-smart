import { readFileSync } from "node:fs";
import { getEventListeners } from "node:events";
import { describe, expect, it } from "vitest";

type Cleanup = (
  timer: ReturnType<typeof setTimeout>,
  timeoutAbortController: AbortController,
  dynamicAccessAbortSignal: AbortSignal | undefined,
) => boolean;

// Execute the cleanup and timeout decision from the installed framework, not a
// copy of the fix. The following comment marks the real timeout-error branch.
function getInstalledCleanup(moduleFormat: "commonjs" | "esm"): Cleanup {
  const prefix = moduleFormat === "esm" ? "esm/" : "";
  const source = readFileSync(
    `node_modules/next/dist/${prefix}server/use-cache/use-cache-wrapper.js`,
    "utf8",
  );
  const start = source.indexOf("clearTimeout(timer);", source.indexOf("case 'prerender-runtime':"));
  const branch = source.slice(start).match(/^([\s\S]*?)if \(([^\n]+)\) \{\s*\/\/ When the timeout/);
  if (!branch) throw new Error("Next cache timeout branch changed; review the backport.");

  return new Function(
    "timer",
    "timeoutAbortController",
    "dynamicAccessAbortSignal",
    `${branch[1]}return ${branch[2]};`,
  ) as Cleanup;
}

describe.each(["commonjs", "esm"] as const)("Next cache cleanup (%s)", (moduleFormat) => {
  const cleanup = getInstalledCleanup(moduleFormat);

  it("releases a successful composite without reporting a timeout", () => {
    const timeout = new AbortController();
    const dynamicAccess = new AbortController();
    const composite = AbortSignal.any([dynamicAccess.signal, timeout.signal]);
    composite.addEventListener("abort", () => {}, { once: true });

    expect(
      cleanup(
        setTimeout(() => {}, 1000),
        timeout,
        dynamicAccess.signal,
      ),
    ).toBe(false);
    expect(composite.aborted).toBe(true);
    expect(getEventListeners(composite, "abort")).toHaveLength(0);
    expect(dynamicAccess.signal.aborted).toBe(false);
  });

  it("preserves a real timeout and its error", () => {
    const timeout = new AbortController();
    const error = new Error("Cache fill timed out");
    timeout.abort(error);

    expect(
      cleanup(
        setTimeout(() => {}, 1000),
        timeout,
        new AbortController().signal,
      ),
    ).toBe(true);
    expect(timeout.signal.reason).toBe(error);
  });

  it("leaves a direct timeout signal active when there is no composite", () => {
    const timeout = new AbortController();

    expect(
      cleanup(
        setTimeout(() => {}, 1000),
        timeout,
        undefined,
      ),
    ).toBe(false);
    expect(timeout.signal.aborted).toBe(false);
  });

  it("keeps dynamic-access cancellation distinguishable from a timeout", () => {
    const timeout = new AbortController();
    const dynamicAccess = new AbortController();
    const error = new Error("Dynamic access");
    dynamicAccess.abort(error);

    expect(
      cleanup(
        setTimeout(() => {}, 1000),
        timeout,
        dynamicAccess.signal,
      ),
    ).toBe(false);
    expect(dynamicAccess.signal.reason).toBe(error);
  });
});
