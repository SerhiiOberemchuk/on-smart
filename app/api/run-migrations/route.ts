import { db } from "@/db/db";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";

export async function GET() {
  try {
    const responseMigration = await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    return Response.json({ success: true, message: "Migration successed!", responseMigration });
  } catch (error) {
    return Response.json({ error });
  }
}
