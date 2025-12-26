import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
const connection = mysql.createPool({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  database: process.env.DATABASE_NAME!,
  password: process.env.DATABASE_PASSWORD!,

  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // connectionLimit: 5,
});
export const db = drizzle({ client: connection });
