import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";

export async function GET() {
  try {
    const res = await db.select().from(categoryProductsSchema);
    return Response.json({ success: true, data: res, error: null }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, data: null, error }, { status: 500 });
  }
}
