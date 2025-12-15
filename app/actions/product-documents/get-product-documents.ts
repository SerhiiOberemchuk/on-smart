"use server";

import { db } from "@/db/db";
import {
  productDocumentsSchema,
  ProductDocumentsType,
} from "@/db/schemas/product-documents.schema";
import { eq } from "drizzle-orm";

export async function getProductDocumentsById(props: Pick<ProductDocumentsType, "product_id">) {
  try {
    const response = await db
      .select()
      .from(productDocumentsSchema)
      .where(eq(productDocumentsSchema.product_id, props.product_id));

    return { success: true, error: null, data: response[0] };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
