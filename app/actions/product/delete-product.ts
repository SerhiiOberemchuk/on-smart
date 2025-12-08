"use server";

import { db } from "@/db/db";
import { Product, productsSchema } from "@/db/schemas/product-schema";
import { eq } from "drizzle-orm";

export async function deleteProductById(id: Product["id"]) {
  if (!id) {
    return {
      success: false,
      error: "Id requared",
    };
  }
  try {
    const response = await db.delete(productsSchema).where(eq(productsSchema.id, id));
    console.log(response);

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
