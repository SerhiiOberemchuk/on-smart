"use server";

import { db } from "@/db/db";
import { Product, productsSchema } from "@/db/schemas/product";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function deleteProductById(id: Product["id"]) {
  if (!id) {
    return {
      success: false,
      error: "Id requared",
    };
  }
  updateTag("get_all_product");

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
