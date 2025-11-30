import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./auth-schema.ts", "./db/schemas"],
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    database: process.env.DATABASE_NAME!,
    password: process.env.DATABASE_PASSWORD!,
  },
});
