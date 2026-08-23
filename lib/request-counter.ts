// Shared request counter for the memory investigation.
//
// `proxy.ts` and `instrumentation.ts` are compiled into SEPARATE Turbopack
// chunks, so a module-level variable would give each of them its own copy.
// A `Symbol.for` key on `globalThis` is registry-global and survives that,
// which is why the state lives there rather than in a module binding.
const COUNTER_KEY = Symbol.for("@on-smart/request-count");

type CounterHost = typeof globalThis & { [COUNTER_KEY]?: { count: number } };

function getHost(): { count: number } {
  const host = globalThis as CounterHost;
  return (host[COUNTER_KEY] ??= { count: 0 });
}

/** Called once per request that the proxy matches. */
export function countRequest(): void {
  getHost().count += 1;
}

/** Reads the count and resets it, so each sample reports its own window. */
export function takeRequestCount(): number {
  const host = getHost();
  const { count } = host;
  host.count = 0;
  return count;
}
