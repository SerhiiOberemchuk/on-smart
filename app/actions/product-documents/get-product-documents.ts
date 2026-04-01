"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  productDocumentsSchema,
  ProductDocumentsType,
} from "@/db/schemas/product-documents.schema";

type ProductDocumentsRow = typeof productDocumentsSchema.$inferSelect;

type GetProductDocumentsByIdResult =
  | {
      success: true;
      data: ProductDocumentsRow | null;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

export async function getProductDocumentsById(
  props: Pick<ProductDocumentsType, "product_id">,
): Promise<GetProductDocumentsByIdResult> {
  if (!props.product_id) {
    return {
      success: false,
      data: null,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

  try {
    const response = await db
      .select()
      .from(productDocumentsSchema)
      .where(eq(productDocumentsSchema.product_id, props.product_id));

    return {
      success: true,
      data: response[0] ?? null,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductDocumentsById]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product documents",
    };
  }
}
