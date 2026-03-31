import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const isProd = process.env.NODE_ENV === "production";
const globalForDb = globalThis as typeof globalThis & {
  __mysqlPool?: mysql.Pool;
};

const connection =
  globalForDb.__mysqlPool ??
  mysql.createPool({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    database: process.env.DATABASE_NAME!,
    password: process.env.DATABASE_PASSWORD!,

    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectionLimit: Number(process.env.DATABASE_POOL_LIMIT ?? 10),
    maxIdle: Number(process.env.DATABASE_POOL_MAX_IDLE ?? 10),
    idleTimeout: Number(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ?? 60000),
    queueLimit: 0,
    connectTimeout: 5000,
    ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
  });

if (!globalForDb.__mysqlPool) {
  globalForDb.__mysqlPool = connection;
}

export const db = drizzle({ client: connection });
