"use server";

import { getErrorRecord, serializeDatabaseError } from "@/lib/serialize-database-error";
import { db } from "@/db/db";
import { sql } from "drizzle-orm";

export async function testDbConnection() {
  const startedAt = Date.now();

  try {
    const res = await db.execute(sql`SELECT 1 as ok`);
    console.log("DB CONNECTED ✅", { ms: Date.now() - startedAt, res });
    return { ok: true, ms: Date.now() - startedAt };
  } catch (error) {
    const record = getErrorRecord(error);
    const cause = getErrorRecord(record.cause);
    const original = getErrorRecord(record.original);
    const ms = Date.now() - startedAt;

    console.error("DB CONNECTION ERROR ❌", {
      ms,
      env: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT ?? "3306(default)",
        user: process.env.DATABASE_USER,
        db: process.env.DATABASE_NAME,
        // password НЕ логуємо
      },
      details: serializeDatabaseError(error),
    });

    return {
      ok: false,
      ms,
      error: typeof record.message === "string" ? record.message : "Database connection failed",
      code: record.code ?? cause.code ?? original.code,
      sqlMessage: record.sqlMessage ?? cause.sqlMessage ?? original.sqlMessage,
    };
  }
}
