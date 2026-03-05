import pRetry, { type Options as PRetryOptions } from "p-retry";

const RETRYABLE_DB_ERROR_CODES = [
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNRESET",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
] as const;

export function isRetryableDbError(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message = error instanceof Error ? error.message : String(error);

  return RETRYABLE_DB_ERROR_CODES.some(
    (retryCode) => code === retryCode || message.includes(retryCode),
  );
}

export const DB_RETRY_OPTIONS = {
  retries: 10,
  minTimeout: 800,
  factor: 1,
} as const;

export const BRAND_READ_RETRY_OPTIONS = DB_RETRY_OPTIONS;

type RetryDbOptions = Omit<PRetryOptions, "shouldRetry" | "onFailedAttempt">;

export function retryDb<T>(fn: () => Promise<T>, options: RetryDbOptions = {}): Promise<T> {
  return pRetry(fn, {
    ...DB_RETRY_OPTIONS,
    ...options,
    onFailedAttempt: ({ error, attemptNumber, retriesLeft }) => {
      console.warn(
        `[retryDb] Attempt ${attemptNumber} failed. Retries left: ${retriesLeft}. ${error.message}`,
      );
    },
    shouldRetry: ({ error }) => isRetryableDbError(error),
  });
}
