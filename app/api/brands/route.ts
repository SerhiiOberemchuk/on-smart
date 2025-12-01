import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await db.select().from(brandProductsSchema);
    return NextResponse.json({ success: true, data: res, error: null }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, error }, { status: 500 });
  }
}
