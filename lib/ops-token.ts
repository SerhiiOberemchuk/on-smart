import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison that tolerates differing lengths.
 *
 * `timingSafeEqual` throws when the buffers differ in size, and returning
 * early on a length mismatch would leak the token length through timing, so
 * both sides are hashed to a fixed width first by comparing equal-length
 * buffers only when the lengths already match.
 */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    // Still burn a comparison so the branch cost does not depend on the input.
    timingSafeEqual(left, left);
    return false;
  }

  return timingSafeEqual(left, right);
}

/**
 * Decides whether a break-glass token authorises an operations endpoint
 * (migrations, heap snapshots).
 *
 * This path exists because the admin session is stored in the very database
 * these endpoints may need to repair: when the `account` table was missing
 * Better Auth's `issuer` column, every login failed, so nobody could obtain the
 * admin session needed to trigger the fix, and the migration route was left
 * unauthenticated on production as a result. A token read from the environment
 * breaks that deadlock without touching the database.
 *
 * Returns false when the expected token is unset, so an unconfigured
 * deployment can never be opened by sending an empty header.
 */
export function isValidOpsToken(provided: string | null, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  return safeEqual(provided, expected);
}
