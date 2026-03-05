import { sleep } from "./sleep";
import { isRetryableDbError } from "./retry-db";

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
