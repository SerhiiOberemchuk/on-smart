"use server";

import { db } from "@/db/db";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

type GetFotoFromGalleryResult =
  | {
      success: true;
      data: typeof productFotoGallery.$inferSelect;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "NOT_FOUND" | "DB_ERROR";
      errorMessage: string;
    };

class GalleryNotFoundError extends Error {
  constructor() {
    super("Gallery does not exist");
    this.name = "GalleryNotFoundError";
  }
}

async function getFotoFromGalleryCachedCore(
  params: { parent_product_id: string },
): Promise<GetFotoFromGalleryResult> {
  "use cache";
  cacheTag(CACHE_TAGS.gallery.byParentProductId(params.parent_product_id));

  const response = await db
    .select()
    .from(productFotoGallery)
    .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));

  if (!response.length) {
    throw new GalleryNotFoundError();
  }

  return {
    success: true,
    data: response[0],
    errorCode: null,
    errorMessage: null,
  };
}

export async function getFotoFromGallery(
  params: { parent_product_id: string },
): Promise<GetFotoFromGalleryResult> {
  if (!params.parent_product_id) {
    return {
      success: false,
      data: null,
      errorCode: "INVALID_INPUT",
      errorMessage: "Parent product id is required",
    };
  }

  try {
    return await getFotoFromGalleryCachedCore(params);
  } catch (error) {
    if (error instanceof GalleryNotFoundError) {
      return {
        success: false,
        data: null,
        errorCode: "NOT_FOUND",
        errorMessage: error.message,
      };
    }

    console.error("[getFotoFromGallery]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load gallery",
    };
  }
}
