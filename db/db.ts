// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });
// export const db = drizzle({ client: pool });

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
