function isError(e: unknown): e is Error {
  return e instanceof Error;
}

export async function safeQuery<T>(fn: () => Promise<T>, retries = 10, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const message = isError(err) ? err.message.toLowerCase() : String(err ?? "").toLowerCase();

    const fatalErrors = ["syntax", "duplicate", "constraint", "not null", "invalid"];

    if (fatalErrors.some((e) => message.includes(e))) {
      throw err;
    }

    if (retries <= 0) {
      throw err;
    }

    await new Promise((res) => setTimeout(res, delay));

    return safeQuery(fn, retries - 1, delay);
  }
}
