const DEFAULT_DESCRIPTION_MAX_LENGTH = 165;
const DEFAULT_TITLE_MAX_LENGTH = 70;

export function normalizeSeoText(value: string): string {
  return value.replace(/\|/g, ". ").replace(/\s+/g, " ").trim();
}

export function truncateSeoText(value: string, maxLength: number): string {
  const normalized = normalizeSeoText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength - 1);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const safeText = lastSpaceIndex > 40 ? truncated.slice(0, lastSpaceIndex) : truncated;

  return `${safeText.trimEnd()}…`;
}

export function buildSeoTitle(value: string, maxLength = DEFAULT_TITLE_MAX_LENGTH): string {
  return truncateSeoText(value, maxLength);
}

export function buildSeoDescription({
  parts,
  fallback,
  maxLength = DEFAULT_DESCRIPTION_MAX_LENGTH,
}: {
  parts: Array<string | null | undefined | false>;
  fallback: string;
  maxLength?: number;
}): string {
  const text = parts
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ");

  return truncateSeoText(text || fallback, maxLength);
}

export function formatEuroPrice(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(numericValue);
}
