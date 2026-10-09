export function getErrorRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function pick(value: unknown, keys: string[]) {
  const record = getErrorRecord(value);
  return Object.fromEntries(keys.map((key) => [key, record[key]]));
}

const DATABASE_ERROR_KEYS = [
  "code",
  "errno",
  "sqlState",
  "sqlMessage",
  "fatal",
  "syscall",
  "address",
  "port",
  "host",
];

function getNestedError(value: unknown) {
  if (!value) return null;
  return {
    ...pick(value, ["name", "message"]),
    ...pick(value, DATABASE_ERROR_KEYS),
    ...pick(value, ["stack"]),
  };
}

export function serializeDatabaseError(value: unknown) {
  const error = getErrorRecord(value);
  let enumerable: unknown = null;
  try {
    enumerable = JSON.parse(JSON.stringify(value));
  } catch {
    // Circular driver errors still retain their explicit diagnostic fields below.
  }
  return {
    base: pick(error, ["name", "message", "stack"]),
    common: pick(error, DATABASE_ERROR_KEYS),
    cause: getNestedError(error.cause),
    original: getNestedError(error.original),
    enumerable,
  };
}
