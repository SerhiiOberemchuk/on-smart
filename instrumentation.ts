// Diagnostics for the recurring `SyntaxError: Unexpected end of JSON input`
// (digest 3278538558) that fills Aruba's run.log. Next strips its own frames
// from that trace, so the log shows only `at JSON.parse (<anonymous>)` — no
// route, no method, no caller. `onRequestError` is the one place that still has
// the request attached to the error, so it can name the culprit.
//
// Errors are also pushed to Telegram so they surface without anyone watching
// Aruba's log viewer — see lib/telegram-alert.ts for the dedupe/rate limits that
// keep this from interfering with the order notifications.
//
// Next 16 does not re-export the instrumentation types from the package root,
// so the signature is declared locally rather than deep-importing from
// `next/dist/server/instrumentation/types`.
import { sendTelegramAlert } from "@/lib/telegram-alert";
import { baseUrl } from "@/types/baseUrl";

// Named in every alert so a staging deploy pointing at the same bot is
// immediately distinguishable from production.
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

export function register(): void {
  // `register` also runs in the edge runtime, where `process.memoryUsage` and
  // timers are not meaningful.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const alertAtMb = Number(process.env.MEMORY_ALERT_RSS_MB) || DEFAULT_RSS_ALERT_MB;

  instrumentFetch();

  const timer = setInterval(() => {
    const usage = process.memoryUsage();
    const rssMb = toMb(usage.rss);

    console.log(
      `[memory] rss=${rssMb}MB heapUsed=${toMb(usage.heapUsed)}MB ` +
        `heapTotal=${toMb(usage.heapTotal)}MB external=${toMb(usage.external)}MB ` +
        `arrayBuffers=${toMb(usage.arrayBuffers)}MB | fetch/5m: ${drainFetchDelta()}`,
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

type RequestErrorContext = {
  routerKind: "Pages Router" | "App Router";
  routePath: string;
  routeType: "render" | "route" | "action" | "proxy";
  renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
  revalidateReason: "on-demand" | "stale" | undefined;
};

type ErrorRequest = Readonly<{
  path: string;
  method: string;
  headers: NodeJS.Dict<string | string[]>;
}>;

// Allow-listed on purpose: `cookie` and `authorization` carry session tokens and
// must never be written to run.log. `next-action` is the one that matters here —
// its presence proves the failing request is a Server Action, and its value is
// the ID that the earlier `Received "x"` errors were choking on.
const LOGGED_HEADERS = [
  "content-type",
  "content-length",
  "next-action",
  "next-router-state-tree",
  "user-agent",
  "referer",
  "x-forwarded-for",
] as const;

export async function onRequestError(
  error: unknown,
  request: ErrorRequest,
  context: Readonly<RequestErrorContext>,
): Promise<void> {
  const headers: Record<string, string> = {};

  for (const name of LOGGED_HEADERS) {
    const value = request.headers[name];
    if (value !== undefined) headers[name] = Array.isArray(value) ? value.join(", ") : value;
  }

  const digest = (error as { digest?: unknown })?.digest;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    "[onRequestError]",
    JSON.stringify({
      method: request.method,
      path: request.path,
      routeType: context.routeType,
      routerKind: context.routerKind,
      routePath: context.routePath,
      renderSource: context.renderSource,
      revalidateReason: context.revalidateReason,
      digest,
      message,
      headers,
    }),
  );

  // Printed separately — a multi-line stack escaped into the JSON above would be
  // unreadable in the run.log viewer.
  if (stack) console.error(stack);

  // The digest is Next's own hash of the error, so identical failures collapse
  // into one alert. Errors without a digest fall back to message + route, which
  // groups the same way for practical purposes.
  await sendTelegramAlert({
    key: typeof digest === "string" ? digest : `${message}@${context.routePath}`,
    title: `${context.routeType} error on ${baseHost}`,
    details: {
      request: `${request.method} ${request.path}`,
      route: `${context.routePath} (${context.renderSource ?? context.routerKind})`,
      digest: typeof digest === "string" ? digest : undefined,
      error: message,
      // Only the head of the stack: the rest is noise in a chat message, and the
      // full trace is already in run.log above.
      stack: stack?.split("\n").slice(0, 4).join("\n"),
      referer: headers.referer,
      client: headers["user-agent"],
    },
  });
}
