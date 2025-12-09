"use server";

import { db } from "@/db/db";
import { productDocumentsSchema, ProductDocumentsType } from "@/db/schemas/product-documents";
import { eq } from "drizzle-orm";

export async function updateProductDocumentsById(props: ProductDocumentsType) {
  try {
    const isExistDocuments = await db
      .select()
      .from(productDocumentsSchema)
      .where(eq(productDocumentsSchema.product_id, props.product_id));
    if (isExistDocuments.length === 0) {
      await db.insert(productDocumentsSchema).values(props);
    }
    const response = await db
      .update(productDocumentsSchema)
      .set({ documents: props.documents })
      .where(eq(productDocumentsSchema.product_id, props.product_id));

    console.log("response create document", response);

    return { success: true, error: null, data: response[0].serverStatus };
  } catch (error) {
    return { success: false, error };
  }
}
