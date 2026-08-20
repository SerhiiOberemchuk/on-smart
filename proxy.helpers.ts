// Pure decision helpers for `proxy.ts`, kept separate so they can be unit tested
// without a Next request context. A mistake here would redirect the whole site
// to the login page, so every branch is covered in proxy.helpers.test.ts.

/**
 * Next accepts a Server Action id only when it is exactly this long
 * (`SERVER_REFERENCE_ID_LENGTH` in `next/dist/shared/lib/server-reference-info`).
 * Anything else is rejected by the framework anyway — we just reject it earlier.
 */
const SERVER_REFERENCE_ID_LENGTH = 42;

/**
 * Attack traffic seen in production sends `Next-Action: x` (also "nn", "zy",
 * "exploit", …) together with a corrupt router-state header. Next rejects the id
 * but only AFTER it has started rendering, which kicks off a background
 * revalidation that then fails — and those failed renders are what has been
 * growing `arrayBuffers` on the server.
 *
 * Requests with no `Next-Action` header at all are normal page loads and must
 * pass through untouched. Progressive-enhancement form posts carry the action id
 * in the body rather than the header, so they are unaffected too.
 */
export function isMalformedServerAction(nextActionHeader: string | null): boolean {
  if (nextActionHeader === null) return false;
  return nextActionHeader.length !== SERVER_REFERENCE_ID_LENGTH;
}

/** Route prefixes that require a signed-in customer. */
const PROTECTED_PREFIXES = ["/admin", "/account", "/checkout"] as const;

/**
 * Prefix match on path SEGMENTS. A plain `startsWith` would also match
 * `/administrator`, which is one of the paths scanners probe most often.
 */
function hasPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** The legacy admin login route, now folded into the unified `/accedi` page. */
export function isLegacyAdminAuthPath(pathname: string): boolean {
  return hasPathPrefix(pathname, "/admin/auth");
}

/**
 * Order-completed pages (including the SumUp return handler) must stay reachable
 * without a session — payment redirects can land here logged out.
 */
export function isPublicCheckoutResult(pathname: string): boolean {
  return hasPathPrefix(pathname, "/checkout/completato");
}

/** True only for the account-gated areas; everything else is public. */
export function requiresSession(pathname: string): boolean {
  if (isPublicCheckoutResult(pathname)) return false;
  return PROTECTED_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
}
