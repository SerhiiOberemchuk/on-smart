import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";

export async function GET() {
  const start = Date.now();
  try {
    const rows = await db.select().from(brandProductsSchema).limit(1);
    return Response.json({
      ok: true,
      rows: rows.length,
      tookMs: Date.now() - start,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        rows: 0,
        tookMs: Date.now() - start,
        ts: new Date().toISOString(),
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 503 },
    );
  }
}
