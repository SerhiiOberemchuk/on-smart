// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./auth-schema.ts", "./db/schemas"],
  dialect: "mysql",
  dbCredentials: {
    host: "31.11.38.12",
    user: "Sql1902646",
    database: "Sql1902646_1",
    password: ".9KcyuMKx!pi8TN",
    // url: process.env.DATABASE_URL!,
  },
});
