/**
 * Validate a `?redirect=` target as a same-origin relative path (open-redirect guard).
 * Accepts only paths starting with a single "/". Falls back otherwise.
 */
export function safeRedirect(target: string | null | undefined, fallback: string): string {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;
  if (target.includes("://") || target.includes("\\")) return fallback;
  return target;
}
