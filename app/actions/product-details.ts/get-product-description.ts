"use server";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";
import { eq } from "drizzle-orm";

export async function getProductDescriptionById({ id }: { id: string }) {
  try {
    const response = await db
      .select()
      .from(productDescriptionSchema)
      .where(eq(productDescriptionSchema.product_id, id));
    return {
      success: true,
      data: response[0],
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
