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
  host: "31.11.38.12",
  user: "Sql1902646",
  database: "Sql1902646_1",
  password: ".9KcyuMKx!pi8TN",
});
export const db = drizzle({ client: connection });
