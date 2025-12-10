"use server";

import { db } from "@/db/db";
import { Product, productsSchema } from "@/db/schemas/product";
import { eq } from "drizzle-orm";

export async function getProductById(id: Product["id"]) {
  if (!id) {
    return { success: false, error: "Id as requared!" };
  }
  try {
    const rows = await db.select().from(productsSchema).where(eq(productsSchema.id, id));

    const product = rows[0] ?? null;

    if (!product) {
      return {
        success: false,
        data: null,
        error: "Товар не знайдено",
      };
    }

    return {
      success: true,
      data: product,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error,
    };
  }
}
