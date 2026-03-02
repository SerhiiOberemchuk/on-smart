import { sleep } from "./sleep";

const RETRYABLE_DB_ERROR_CODES = [
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNRESET",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
] as const;

export function isRetryableDbError(e: unknown) {
  const code =
    typeof e === "object" && e !== null && "code" in e ? String((e as { code?: unknown }).code ?? "") : "";
  const msg = e instanceof Error ? e.message : String(e);
  return RETRYABLE_DB_ERROR_CODES.some((retryCode) => code === retryCode || msg.includes(retryCode));
}

export async function withRetrySelective<T>(
  fn: () => Promise<T>,
  opts: { tries?: number; delayMs?: number; linearBackoffMs?: number } = {},
): Promise<T> {
  const tries = opts.tries ?? 6; // 6 * 1s = 6s
  const delayMs = opts.delayMs ?? 1000;
  const linearBackoffMs = opts.linearBackoffMs ?? 0;

  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!isRetryableDbError(e)) throw e;
      const sleepMs = delayMs + i * linearBackoffMs;
      await sleep(sleepMs);
    }
  }
  throw last;
}
