"use server";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { isBuildPhase } from "@/utils/guard-build";
import { withRetrySelective } from "@/utils/with-retry-selective";
import {
  productCharacteristicsSchema,
  ProductCharacteristicType,
} from "@/db/schemas/product_characteristic.schema";
import {
  productCharacteristicValuesSchema,
  ProductCharacteristicValuesType,
} from "@/db/schemas/product_characteristic_values.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

const CHARACTERISTICS_READ_RETRY_OPTIONS = {
  tries: 10,
  delayMs: 800,
  linearBackoffMs: 250,
} as const;
const BUILD_PHASE_SKIP_ERROR = "skipped: build phase";

export type CharacteristicMetaItem = {
  id: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  in_filter: number;
  is_required: boolean;
  is_multiple: boolean;
  values: string[];
};

export type GetAllCharacteristicsWithMetaResponse = Promise<
  | {
      success: true;
      data: CharacteristicMetaItem[];
      error: null;
    }
  | {
      success: false;
      error: unknown;
      data: [];
    }
>;

async function getAllCharacteristicsWithMetaCachedCore(): Promise<CharacteristicMetaItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.characteristics.allWithMeta);
  cacheLife("minutes");

  return withRetrySelective(
    async () =>
      db
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
        .groupBy(productCharacteristicsSchema.id, categoryProductsSchema.name),
    CHARACTERISTICS_READ_RETRY_OPTIONS,
  );
}

export async function createCharacteristic(params: Omit<ProductCharacteristicType, "id">) {
  try {
    const res = await db.insert(productCharacteristicsSchema).values(params).$returningId();
    updateTag(CACHE_TAGS.characteristics.allWithMeta);
    updateTag(CACHE_TAGS.catalog.filters);
    updateTag(CACHE_TAGS.catalog.characteristicFilters);

    return { success: true, id: res[0].id };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAllCharacteristic() {
  try {
    const resp = await db.select().from(productCharacteristicsSchema);
    return { data: resp, error: "" };
  } catch (error) {
    return { error, data: [] };
  }
}

export async function getAllCharacteristicsWithMeta(): GetAllCharacteristicsWithMetaResponse {
  if (isBuildPhase()) {
    return { success: false, error: BUILD_PHASE_SKIP_ERROR, data: [] };
  }

  try {
    const data = await getAllCharacteristicsWithMetaCachedCore();
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}

export async function getCharacteristicById(id: string) {
  try {
    const [characteristic] = await db
      .select()
      .from(productCharacteristicsSchema)
      .where(eq(productCharacteristicsSchema.id, id))
      .limit(1);

    if (!characteristic) {
      return { success: false, error: "Characteristic not found" };
    }

    const values = await db
      .select({
        value: productCharacteristicValuesSchema.value,
        id: productCharacteristicValuesSchema.id,
      })
      .from(productCharacteristicValuesSchema)
      .where(eq(productCharacteristicValuesSchema.characteristic_id, id));

    return {
      success: true,
      data: {
        ...characteristic,
        values,
      },
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteCharacteristic(id: string) {
  try {
    await db
      .delete(productCharacteristicValuesSchema)
      .where(eq(productCharacteristicValuesSchema.characteristic_id, id));

    await db.delete(productCharacteristicsSchema).where(eq(productCharacteristicsSchema.id, id));

    updateTag(CACHE_TAGS.characteristics.allWithMeta);
    updateTag(CACHE_TAGS.catalog.filters);
    updateTag(CACHE_TAGS.catalog.characteristicFilters);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export type UpdateCharacteristicPayload = Omit<ProductCharacteristicType, "id"> & {
  values: Pick<ProductCharacteristicValuesType, "value" | "id">[];
};

export async function updateCharacteristic(
  characteristicId: string,
  data: UpdateCharacteristicPayload,
) {
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(productCharacteristicsSchema)
        .set({
          name: data.name,
          category_id: data.category_id,
          in_filter: data.in_filter,
          is_required: data.is_required,
          is_multiple: data.is_multiple,
        })
        .where(eq(productCharacteristicsSchema.id, characteristicId));

      await tx
        .delete(productCharacteristicValuesSchema)
        .where(eq(productCharacteristicValuesSchema.characteristic_id, characteristicId));

      const valuesToInsert = data.values
        .filter((v) => v.value.trim() !== "")
        .map((v) => ({
          value: v.value,
          characteristic_id: characteristicId,
        }));

      if (valuesToInsert.length) {
        await tx.insert(productCharacteristicValuesSchema).values(valuesToInsert);
      }
    });

    updateTag(CACHE_TAGS.characteristics.allWithMeta);
    updateTag(CACHE_TAGS.catalog.filters);
    updateTag(CACHE_TAGS.catalog.characteristicFilters);

    return { success: true };
  } catch (error) {
    console.error("updateCharacteristic error:", error);
    return { success: false, error };
  }
}
