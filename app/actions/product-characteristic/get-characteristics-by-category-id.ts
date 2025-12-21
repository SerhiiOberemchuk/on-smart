// app/actions/product-characteristic/get-characteristics-by-category-id.ts
"use server";

import { db } from "@/db/db";
import { eq, sql } from "drizzle-orm";
import { productCharacteristicsSchema } from "@/db/schemas/product_characteristic.schema";
import { productCharacteristicValuesSchema } from "@/db/schemas/product_characteristic_values.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";

export type GetCharacteristicsByCategoryIdType = {
  id: string;
  name: string;
  category_id: string;
  category_name: string | null;
  in_filter: boolean;
  is_required: boolean;
  is_multiple: boolean;
  values: string[];
};

export async function getCharacteristicsByCategoryId({
  category_id,
}: {
  category_id: string;
}): Promise<{
  success: boolean;
  data: GetCharacteristicsByCategoryIdType[];
}> {
  const data = await db
    .select({
      id: productCharacteristicsSchema.id,
      name: productCharacteristicsSchema.name,
      category_id: productCharacteristicsSchema.category_id,
      category_name: categoryProductsSchema.name,
      in_filter: productCharacteristicsSchema.in_filter,
      is_required: productCharacteristicsSchema.is_required,
      is_multiple: productCharacteristicsSchema.is_multiple,
      values: sql<string[]>`
        COALESCE(
          JSON_ARRAYAGG(${productCharacteristicValuesSchema.value}),
          JSON_ARRAY()
        )
      `,
    })
    .from(productCharacteristicsSchema)
    .leftJoin(
      categoryProductsSchema,
      eq(categoryProductsSchema.id, productCharacteristicsSchema.category_id),
    )
    .leftJoin(
      productCharacteristicValuesSchema,
      eq(productCharacteristicValuesSchema.characteristic_id, productCharacteristicsSchema.id),
    )
    .where(eq(productCharacteristicsSchema.category_id, category_id))
    .groupBy(productCharacteristicsSchema.id, categoryProductsSchema.name);

  return { success: true, data };
}
