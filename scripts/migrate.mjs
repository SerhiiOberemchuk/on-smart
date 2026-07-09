// Runs Drizzle migrations at container start (Aruba: the DB is reachable only
// from inside the hosting network, so migrations cannot run during build).
// Invoked by the Dockerfile CMD before `node server.js`; prints a clear status
// to the container console.
//
// Behavior on failure: logs the error and exits 0 so the shop still starts on
// the old schema (fail-open). Set MIGRATE_STRICT=1 to block startup instead.

import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");
const RETRIES = Number(process.env.MIGRATE_RETRIES ?? 10);
const RETRY_DELAY_MS = Number(process.env.MIGRATE_RETRY_DELAY_MS ?? 3000);
const isProd = process.env.NODE_ENV === "production";

const log = (message) => console.log(`[migrate] ${message}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createConnection() {
  return mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    connectTimeout: 10000,
    ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

async function connectWithRetry() {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const connection = await createConnection();
      await connection.query("SELECT 1");
      log(`database connection OK (attempt ${attempt}/${RETRIES})`);
      return connection;
    } catch (error) {
      log(`database not reachable (attempt ${attempt}/${RETRIES}): ${error.code ?? ""} ${error.message}`);
      if (attempt === RETRIES) throw error;
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw new Error("unreachable");
}

async function getLastAppliedMillis(connection) {
  try {
    const [rows] = await connection.query(
      "SELECT created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1",
    );
    return rows.length ? Number(rows[0].created_at) : 0;
  } catch {
    // Table does not exist yet — fresh database, everything is pending.
    return 0;
  }
}

async function main() {
  log(`starting migration check (env: ${process.env.NODE_ENV ?? "development"})`);

  const journal = JSON.parse(
    await readFile(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8"),
  );
  const entries = journal.entries ?? [];
  log(`local migration files: ${entries.length} (latest: ${entries.at(-1)?.tag ?? "none"})`);

  const connection = await connectWithRetry();
  try {
    const lastApplied = await getLastAppliedMillis(connection);
    const pending = entries.filter((entry) => entry.when > lastApplied);

    if (pending.length === 0) {
      log("database schema is up to date — nothing to apply");
      return;
    }
    log(`pending migrations (${pending.length}): ${pending.map((entry) => entry.tag).join(", ")}`);

    const db = drizzle({ client: connection });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

    log(`SUCCESS — applied ${pending.length} migration(s): ${pending.map((entry) => entry.tag).join(", ")}`);
  } finally {
    await connection.end().catch(() => {});
  }
}

try {
  await main();
} catch (error) {
  console.error("[migrate] FAILED:", error.code ?? "", error.sqlMessage ?? error.message);
  console.error("[migrate] full error:", error);
  if (process.env.MIGRATE_STRICT === "1") {
    console.error("[migrate] MIGRATE_STRICT=1 — blocking application startup.");
    process.exit(1);
  }
  console.error(
    "[migrate] WARNING: starting the application on the CURRENT (old) schema. " +
      "Fix the migration and redeploy, or set MIGRATE_STRICT=1 to block startup on failure.",
  );
  process.exit(0);
}
