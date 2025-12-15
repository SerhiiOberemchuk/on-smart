"use server";

import { db } from "@/db/db";
import { productsSchema, type ProductType } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { deleteFileFromS3 } from "../files/uploadFile";

export async function deleteProductVariant({
  product_variant_id,
}: {
  product_variant_id: ProductType["id"];
}) {
  try {
    const variantProduct = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, product_variant_id));

    if (!variantProduct.length) {
      return {
        success: false,
        error: "Variant not found",
      };
    }

    const variant = variantProduct[0];

    await db.delete(productsSchema).where(eq(productsSchema.id, variant.id));

    if (variant.imgSrc) {
      await deleteFileFromS3(variant.imgSrc);
    }

    if (variant.parent_product_id) {
      console.log(" if (variant.parent_product_id)");

      const siblings = await db
        .select()
        .from(productsSchema)
        .where(eq(productsSchema.id, variant.parent_product_id));

      console.log({ siblings });

      if (siblings[0].variants?.length) {
        const newVariants = siblings[0].variants.filter((i) => i !== product_variant_id);
        await db
          .update(productsSchema)
          .set({
            variants: newVariants,
            hasVariants: newVariants.length > 0,
          })
          .where(eq(productsSchema.id, variant.parent_product_id));
      }
    }

    updateTag("get_all_product");

    return { success: true };
  } catch (error) {
    console.error("[deleteProductVariant]", error);
    return { success: false, error: "Server error" };
  }
}
