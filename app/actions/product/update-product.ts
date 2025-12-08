"use server";

import { db } from "@/db/db";
import { Product, productsSchema } from "@/db/schemas/product-schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateProductById({
  id,
  data,
}: {
  id: Product["id"];
  data: Partial<Omit<Product, "id">>;
}) {
  updateTag("all-products");

  try {
    await db.update(productsSchema).set(data).where(eq(productsSchema.id, id));

    return { success: true, error: false };
  } catch (error) {
    return { success: false, error };
  }
}
