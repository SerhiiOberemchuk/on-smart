import { takeRequestCount } from "@/lib/request-counter";
import { sendTelegramAlert } from "@/lib/telegram-alert";
import { baseUrl } from "@/types/baseUrl";

const baseHost = new URL(baseUrl).hostname;

// Memory sampling: the container is capped at 640 MiB and V8 sizes its heap from
// that (~320 MB), so the process has already died once from a heap OOM. RSS alone
// cannot distinguish a leak from V8 simply growing lazily toward its ceiling —
// the breakdown below can. `arrayBuffers` in particular is the signature of the
// Next fetch/cache retention bugs: it climbs while `heapUsed` stays flat.
const MEMORY_SAMPLE_INTERVAL_MS = 5 * 60 * 1000;

// Warn while there is still headroom to act. A heap OOM kills the process
// instantly, and a dead process cannot send its own alert.
const DEFAULT_RSS_ALERT_MB = 520;

const toMb = (bytes: number) => Math.round(bytes / 1024 / 1024);

// Fetch attribution. `arrayBuffers` is climbing monotonically (1 -> 78 MB over a
// day) and every known suspect in this class of Next bug retains a *response
// body*, so the question is which caller produces the volume. Counting by host
// answers it — and, just as usefully, can rule fetch out entirely: if no host
// grows in step with `arrayBuffers`, the leak is elsewhere (mysql2 packets,
// sharp output buffers) and we stop looking here.
//
// Note that `next/image` optimization also goes through global fetch
// (`image-optimizer.js` -> `fetchExternalImage`), so remote image pulls from the
// storage bucket show up under their own host and are measured for free.
const fetchCallsByHost = new Map<string, number>();
const fetchCallsAtLastSample = new Map<string, number>();

/**
 * Counts outbound fetches per host, then delegates unchanged.
 *
 * Safe to install in any order relative to Next's own patching: Next guards
 * against double-patching with a global symbol (`patch-fetch.js` ->
 * `isFetchPatched`), not with a property on the fetch function, so wrapping
 * `globalThis.fetch` neither hides its patch nor triggers a second one.
 */
function instrumentFetch(): void {
  const original = globalThis.fetch;

  if (typeof original !== "function") return;

  globalThis.fetch = function instrumentedFetch(
    input: Parameters<typeof original>[0],
    init?: Parameters<typeof original>[1],
  ) {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
      const { host } = new URL(url);
      fetchCallsByHost.set(host, (fetchCallsByHost.get(host) ?? 0) + 1);
    } catch {
      // A malformed or relative URL is not worth failing the request over.
    }

    return original.call(globalThis, input, init);
  } as typeof original;
}

/** Per-host call counts since the previous sample, busiest first. */
function drainFetchDelta(): string {
  const deltas: Array<[string, number]> = [];

  for (const [host, total] of fetchCallsByHost) {
    const delta = total - (fetchCallsAtLastSample.get(host) ?? 0);
    fetchCallsAtLastSample.set(host, total);
    if (delta > 0) deltas.push([host, delta]);
  }

  if (deltas.length === 0) return "none";

  return deltas
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([host, delta]) => `${host}=${delta}`)
    .join(" ");
}

export function registerMemoryDiagnostics(): void {
  const alertAtMb = Number(process.env.MEMORY_ALERT_RSS_MB) || DEFAULT_RSS_ALERT_MB;

  instrumentFetch();

  // Previous sample's external bytes, so each line reports how far the off-heap
  // total moved PER REQUEST. That ratio is the point: a steady KB/req means the
  // growth rides the hot request path, while steady MB/hour with varying
  // traffic means it is time-driven and requests are innocent.
  let previousExternal = process.memoryUsage().external;

  const timer = setInterval(() => {
    const usage = process.memoryUsage();
    const rssMb = toMb(usage.rss);
    const requests = takeRequestCount();
    const externalDelta = usage.external - previousExternal;
    previousExternal = usage.external;
    const perRequest =
      requests > 0 ? `${Math.round(externalDelta / requests / 1024)}KB/req` : "n/a";

    console.log(
      `[memory] rss=${rssMb}MB heapUsed=${toMb(usage.heapUsed)}MB ` +
        `heapTotal=${toMb(usage.heapTotal)}MB external=${toMb(usage.external)}MB ` +
        `arrayBuffers=${toMb(usage.arrayBuffers)}MB ` +
        `| req/5m=${requests} ext${externalDelta >= 0 ? "+" : ""}${Math.round(externalDelta / 1024)}KB ${perRequest} ` +
        `| fetch/5m: ${drainFetchDelta()}`,
    );

    if (rssMb < alertAtMb) return;

    // Keyed so the alert module's dedupe window throttles this to one message
    // per 15 minutes no matter how long the process stays over the threshold.
    void sendTelegramAlert({
      key: "memory-high",
      title: `memory high on ${baseHost}`,
      details: {
        rss: `${rssMb}MB (alert at ${alertAtMb}MB)`,
        heapUsed: `${toMb(usage.heapUsed)}MB of ${toMb(usage.heapTotal)}MB`,
        arrayBuffers: `${toMb(usage.arrayBuffers)}MB`,
        external: `${toMb(usage.external)}MB`,
      },
    });
  }, MEMORY_SAMPLE_INTERVAL_MS);

  // Must not keep the event loop alive and delay container shutdown.
  timer.unref();
}
