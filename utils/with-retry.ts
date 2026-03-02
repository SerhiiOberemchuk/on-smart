type RetryOptions = {
  tries?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
};

const DEFAULT_TRIES = 3;
const DEFAULT_BASE_DELAY_MS = 200;
const DEFAULT_BACKOFF_FACTOR = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { tries = DEFAULT_TRIES, baseDelayMs = DEFAULT_BASE_DELAY_MS, backoffFactor = DEFAULT_BACKOFF_FACTOR }: RetryOptions = {},
): Promise<T> {
  const safeTries = Math.max(1, Math.trunc(tries));
  let lastError: unknown;

  for (let attempt = 0; attempt < safeTries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === safeTries - 1) {
        break;
      }

      await delay(baseDelayMs * Math.pow(backoffFactor, attempt));
    }
  }

  throw lastError;
}
