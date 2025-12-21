"use server";

import { db } from "@/db/db";
import { productsSchema, type ProductType } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import slugify from "@sindresorhus/slugify";
import { ulid } from "ulid";
import { updateTag } from "next/cache";

export async function createProductVariant({
  parentId,
  newData,
}: {
  parentId: ProductType["id"];
  newData: {
    name: string;
    nameFull: string;
    price: string;
    oldPrice: string | null;
    inStock: number;
    isOnOrder: boolean;
    imgSrc: string;
    category_id: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  updateTag("get_all_product");
  try {
    const parentRows = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, parentId));

    if (!parentRows.length) {
      return { success: false, error: "Parent product not found" };
    }

    const parent = parentRows[0];

    const children = await db
      .select({ slug: productsSchema.slug })
      .from(productsSchema)
      .where(eq(productsSchema.parent_product_id, parentId));

    const numbers = children
      .map((c) => {
        const m = c.slug.match(/-v(\d+)$/);
        return m ? Number(m[1]) : null;
      })
      .filter((n): n is number => n !== null);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    const baseSlug = `${parent.slug}-${slugify(newData.nameFull)}`;
    const variantSlug = `${baseSlug}-v${nextNumber}`;

    const newId = ulid();

    const insertData: typeof productsSchema.$inferInsert = {
      id: newId,
      slug: variantSlug,

      name: newData.name,
      nameFull: newData.nameFull,
      price: newData.price,
      oldPrice: newData.oldPrice,
      inStock: newData.inStock,
      isOnOrder: newData.isOnOrder,
      imgSrc: newData.imgSrc,
      category_id: newData.category_id,
      brand_slug: parent.brand_slug,
      category_slug: parent.category_slug,

      parent_product_id: parentId,
      variants: [],
      hasVariants: false,

      rating: "5.0",
    };

    await db.insert(productsSchema).values(insertData);

    const updatedVariants = [...(parent.variants ?? []), newId];

    await db
      .update(productsSchema)
      .set({
        hasVariants: true,
        variants: updatedVariants,
      })
      .where(eq(productsSchema.id, parentId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Server error" };
  }
}
