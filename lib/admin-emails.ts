/**
 * Admin allowlist. `ADMIN_EMAILS` is a comma-separated list of emails that
 * receive `role = "admin"` at registration (see client-accounts spec decision #17).
 * Read per call so an env change takes effect on restart without stale caching.
 */
export function isAdminEmail(email: string): boolean {
  const target = email.trim().toLowerCase();
  if (!target) return false;

  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}
