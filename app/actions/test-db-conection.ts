"use server";

import { db } from "@/db/db";
import { sql } from "drizzle-orm";

function pick(obj: any, keys: string[]) {
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = obj?.[k];
  return out;
}

function serializeError(err: any) {
  // mysql2 / drizzle / node errors often keep details in different places
  const base = {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
  };

  const common = pick(err, [
    "code",
    "errno",
    "sqlState",
    "sqlMessage",
    "fatal",
    "syscall",
    "address",
    "port",
    "host",
  ]);

  const cause = err?.cause
    ? {
        name: err.cause?.name,
        message: err.cause?.message,
        ...pick(err.cause, [
          "code",
          "errno",
          "sqlState",
          "sqlMessage",
          "fatal",
          "syscall",
          "address",
          "port",
          "host",
        ]),
        stack: err.cause?.stack,
      }
    : null;

  // sometimes drizzle wraps original error deeper
  const original = err?.original
    ? {
        name: err.original?.name,
        message: err.original?.message,
        ...pick(err.original, [
          "code",
          "errno",
          "sqlState",
          "sqlMessage",
          "fatal",
          "syscall",
          "address",
          "port",
          "host",
        ]),
        stack: err.original?.stack,
      }
    : null;

  // dump enumerable props too (often includes 'query' / 'params')
  const enumerable = (() => {
    try {
      return JSON.parse(JSON.stringify(err));
    } catch {
      return null;
    }
  })();

  return { base, common, cause, original, enumerable };
}

export async function testDbConnection() {
  const startedAt = Date.now();

  try {
    const res = await db.execute(sql`SELECT 1 as ok`);
    console.log("DB CONNECTED ✅", { ms: Date.now() - startedAt, res });
    return { ok: true, ms: Date.now() - startedAt };
  } catch (error: any) {
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
      details: serializeError(error),
    });

    return {
      ok: false,
      ms,
      error: error?.message,
      code: error?.code ?? error?.cause?.code ?? error?.original?.code,
      sqlMessage: error?.sqlMessage ?? error?.cause?.sqlMessage ?? error?.original?.sqlMessage,
    };
  }
}
