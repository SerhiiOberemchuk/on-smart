import { requireAdminSession } from "@/app/actions/admin/_shared/require-admin-session";
import { db } from "@/db/db";
import { isValidOpsToken } from "@/lib/ops-token";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";

// Manual fallback trigger. The primary mechanism is scripts/migrate.mjs, which
// runs automatically at container start; this endpoint exists for the case
// where that ran before a migration was added.
//
// POST, not GET: this mutates the database, and the site is crawled constantly
// by Googlebot/Bingbot/Baiduspider. A GET here is something a crawler can and
// eventually will trigger on its own.
export async function POST(request: Request) {
  const hasToken = isValidOpsToken(request.headers.get("x-ops-token"), process.env.OPS_TOKEN);

  if (!hasToken) {
    try {
      await requireAdminSession();
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log(`[run-migrations] triggered via ${hasToken ? "token" : "admin session"}`);
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    console.log("[run-migrations] finished successfully");
    return Response.json({ success: true, message: "Migrations applied (or already up to date)." });
  } catch (error) {
    // Logged in full, but not returned: the driver's message carries table and
    // column names, and this endpoint is reachable before authentication for
    // token holders only — no reason to hand schema details to a caller that
    // failed to run anything.
    console.error("[run-migrations] FAILED:", error);
    return Response.json(
      { success: false, error: "Migration failed. See server logs." },
      { status: 500 },
    );
  }
}
