"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateProductById({
  id,
  data,
}: {
  id: ProductType["id"];
  data: Partial<Omit<ProductType, "id">>;
}) {
  try {
    await db.update(productsSchema).set(data).where(eq(productsSchema.id, id));
    updateTag("get_all_product");
    return { success: true, error: false };
  } catch (error) {
    return { success: false, error };
  }
}
