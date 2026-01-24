import { db } from "./db/db";
async function testDrizzle() {
  const result = await db.execute("select 1 as ok");
  console.log("✅ Drizzle OK:", result);
}

testDrizzle().catch((err) => {
  console.error("❌ Drizzle ERROR:", err);
});
