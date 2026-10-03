import type { Metadata } from "next";

const DEFAULT_DESCRIPTION_MAX_LENGTH = 165;
const DEFAULT_TITLE_MAX_LENGTH = 70;
// Google shows ~60 characters; the layout template appends " | OnSmart".
const PRODUCT_TITLE_MAX_LENGTH = 60;

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

function cutAtWordBoundary(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  const lastSpaceIndex = cut.lastIndexOf(" ");
  return (lastSpaceIndex > 0 ? cut.slice(0, lastSpaceIndex) : cut).trimEnd();
}

function nameMentionsBrand(name: string, brandName: string): boolean {
  const brandToken = brandName.split(" ")[0]?.toLowerCase();
  if (!brandToken) return true;
  return name
    .toLowerCase()
    .split(/[\s/-]+/)
    .includes(brandToken);
}

/**
 * "{name} {brand} – {price}", brand only when the name does not already carry
 * it. The price is never cut off: when the title is too long the brand is
 * dropped first, then the name is shortened at a word boundary (no ellipsis).
 */
export function buildProductSeoTitle({
  name,
  brandName,
  price,
}: {
  name: string;
  brandName?: string | null;
  price?: string | null;
}): string {
  const productName = normalizeSeoText(name);
  const brand = brandName ? normalizeSeoText(brandName) : "";
  const priceSuffix = price ? ` – ${price}` : "";
  const nameBudget = PRODUCT_TITLE_MAX_LENGTH - priceSuffix.length;
  const withBrand =
    brand && !nameMentionsBrand(productName, brand) ? `${productName} ${brand}` : productName;

  if (withBrand.length <= nameBudget) return `${withBrand}${priceSuffix}`;
  return `${cutAtWordBoundary(productName, nameBudget)}${priceSuffix}`;
}

/** Only a confirmed empty result deindexes a landing page; a failed read must not. */
export function isLandingPageIndexable(products: { success: boolean; data: unknown[] }): boolean {
  return !products.success || products.data.length > 0;
}

/** Robots for catalog landing pages: an empty brand/category stays crawlable but out of the index. */
export function buildLandingPageRobots(isIndexable: boolean): Metadata["robots"] {
  return {
    index: isIndexable,
    follow: true,
    noarchive: false,
    googleBot: {
      index: isIndexable,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
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
