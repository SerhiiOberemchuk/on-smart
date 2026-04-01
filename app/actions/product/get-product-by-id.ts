"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

type GetProductByIdResult =
  | {
      success: true;
      data: ProductType;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR";
      errorMessage: string;
    };

export async function getProductById(id: ProductType["id"]): Promise<GetProductByIdResult> {
  "use cache";

  if (!id) {
    return {
      success: false,
      data: null,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.byId(id));
  cacheTag(CACHE_TAGS.product.all);

  try {
    const rows = await db.select().from(productsSchema).where(eq(productsSchema.id, id));
    const product = rows[0] ?? null;

    if (!product) {
      return {
        success: false,
        data: null,
        errorCode: "NOT_FOUND",
        errorMessage: "Product not found",
      };
    }

    return {
      success: true,
      data: product,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductById]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product by id",
    };
  }
}
