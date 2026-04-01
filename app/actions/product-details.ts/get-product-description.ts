"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";

type ProductDescriptionRow = typeof productDescriptionSchema.$inferSelect;

type GetProductDescriptionByIdResult =
  | {
      success: true;
      data: ProductDescriptionRow | null;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data?: undefined;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

export async function getProductDescriptionById({
  id,
}: {
  id: string;
}): Promise<GetProductDescriptionByIdResult> {
  if (!id) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

  try {
    const response = await db
      .select()
      .from(productDescriptionSchema)
      .where(eq(productDescriptionSchema.product_id, id));

    return {
      success: true,
      data: response[0] ?? null,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductDescriptionById]", error);
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product description",
    };
  }
}
