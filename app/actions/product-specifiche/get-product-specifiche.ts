"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  productSpecificheSchema,
  ProductSpecificheType,
} from "@/db/schemas/product-specifiche.schema";

type ProductSpecificheRow = typeof productSpecificheSchema.$inferSelect;

type GetProductSpecificheByIdResult =
  | {
      success: true;
      data: ProductSpecificheRow;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR";
      errorMessage: string;
    };

export async function getProductSpecificheById(
  product_id: ProductSpecificheType["product_id"],
): Promise<GetProductSpecificheByIdResult> {
  if (!product_id) {
    return {
      success: false,
      data: null,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

  try {
    const res = await db
      .select()
      .from(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    if (res.length === 0) {
      return {
        success: false,
        data: null,
        errorCode: "NOT_FOUND",
        errorMessage: "Product specifiche not found",
      };
    }

    return {
      success: true,
      data: res[0],
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductSpecificheById]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product specifiche",
    };
  }
}
