function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function assertPromiseLike<T>(
  value: unknown,
  label: string,
): asserts value is Promise<T> {
  const isPromiseLike =
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function";

  if (!isPromiseLike) {
    throw new Error(
      `[${label}] Expected Promise for React.use(), received ${getValueType(value)}.`,
    );
  }
}
