import { requireAdminSession } from "@/app/actions/admin/_shared/require-admin-session";
import { db } from "@/db/db";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";

// Manual fallback trigger (admin-only). The primary mechanism is
// scripts/migrate.mjs, which runs automatically at container start.
export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[run-migrations] manual migration triggered by admin");
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    console.log("[run-migrations] finished successfully");
    return Response.json({ success: true, message: "Migrations applied (or already up to date)." });
  } catch (error) {
    console.error("[run-migrations] FAILED:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
