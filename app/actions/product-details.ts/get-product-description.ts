"use server";

import { db } from "@/db/db";
import { productDescrizioneSchema } from "@/db/schemas/product-details";
import { eq } from "drizzle-orm";

export async function getProductDescriptionById({ id }: { id: string }) {
  try {
    const response = await db
      .select()
      .from(productDescrizioneSchema)
      .where(eq(productDescrizioneSchema.product_id, id));
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
