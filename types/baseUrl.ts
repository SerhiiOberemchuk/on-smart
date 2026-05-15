function normalizeBaseUrl(value: string) {
  const trimmedValue = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
}

export const baseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
);
