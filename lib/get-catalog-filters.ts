"use server";

import slugify from "@sindresorhus/slugify";
import { eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { db } from "@/db/db";
import { productCharacteristicsSchema } from "@/db/schemas/product_characteristic.schema";
import { productCharacteristicValuesSchema } from "@/db/schemas/product_characteristic_values.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { FilterGroup, FilterOption } from "@/types/catalog-filter-options.types";
import { isBuildPhase } from "@/utils/guard-build";
import { withRetrySelective } from "@/utils/with-retry-selective";

const CATALOG_FILTERS_READ_RETRY_OPTIONS = {
  tries: 10,
  delayMs: 800,
  linearBackoffMs: 250,
} as const;

function withUniqueParams(filters: FilterGroup[]): FilterGroup[] {
  const usedParams = new Set<string>();

  return filters.map((filter) => {
    const baseParam = filter.param || "filter";
    let uniqueParam = baseParam;
    let suffix = 2;

    while (usedParams.has(uniqueParam)) {
      uniqueParam = `${baseParam}-${suffix}`;
      suffix += 1;
    }

    usedParams.add(uniqueParam);

    if (uniqueParam === filter.param) {
      return filter;
    }

    return { ...filter, param: uniqueParam };
  });
}

function buildStaticFilters({
  categories,
  brands,
}: {
  categories: Array<{ category_slug: string; name: string }>;
  brands: Array<{ brand_slug: string; name: string }>;
}): FilterGroup[] {
  return [
    {
      param: "categoria",
      title: "Categoria",
      type: "checkbox",
      options: categories.map((item) => ({
        value: item.category_slug,
        label: item.name,
      })),
    },
    {
      param: "brand",
      title: "Brand",
      type: "checkbox",
      options: brands.map((item) => ({
        value: item.brand_slug,
        label: item.name,
      })),
    },
    {
      param: "price",
      title: "Prezzo, Euro €",
      type: "range",
      min: 1,
      max: 99999,
    },
  ];
}

function getBuildSafeFilters(): FilterGroup[] {
  return withUniqueParams(
    buildStaticFilters({
      categories: [],
      brands: [],
    }),
  );
}

async function getCatalogCharacteristicFiltersCachedCore(): Promise<FilterGroup[]> {
  "use cache";
  cacheTag(CACHE_TAGS.catalog.characteristicFilters);
  cacheLife("minutes");

  const characteristics = await withRetrySelective(
    () =>
      db
        .select()
        .from(productCharacteristicsSchema)
        .where(eq(productCharacteristicsSchema.in_filter, 1)),
    CATALOG_FILTERS_READ_RETRY_OPTIONS,
  );

  if (!characteristics.length) return [];

  const characteristicIds = characteristics.map((characteristic) => characteristic.id);

  const values = await withRetrySelective(
    () =>
      db
        .select()
        .from(productCharacteristicValuesSchema)
        .where(inArray(productCharacteristicValuesSchema.characteristic_id, characteristicIds)),
    CATALOG_FILTERS_READ_RETRY_OPTIONS,
  );

  const valuesMap = new Map<string, FilterOption[]>();

  for (const valueItem of values) {
    if (!valuesMap.has(valueItem.characteristic_id)) {
      valuesMap.set(valueItem.characteristic_id, []);
    }

    valuesMap.get(valueItem.characteristic_id)!.push({
      value: slugify(valueItem.value),
      label: valueItem.value,
      characteristic_value_id: valueItem.id,
    });
  }

  return characteristics
    .map((characteristic) => {
      const options = valuesMap.get(characteristic.id) ?? [];
      if (!options.length) return null;

      return {
        param: slugify(characteristic.name),
        title: characteristic.name,
        type: "checkbox",
        options,
      } as FilterGroup;
    })
    .filter(Boolean) as FilterGroup[];
}

export const getCatalogCharacteristicFilters = async (): Promise<FilterGroup[]> => {
  if (isBuildPhase()) {
    return [];
  }

  try {
    return await getCatalogCharacteristicFiltersCachedCore();
  } catch (error) {
    console.error(
      "[getCatalogCharacteristicFilters] Failed to load characteristic filters:",
      error,
    );
    return [];
  }
};

async function getCatalogFiltersCachedCore(): Promise<FilterGroup[]> {
  "use cache";
  cacheTag(CACHE_TAGS.catalog.filters);
  cacheLife("minutes");

  const [categories, brands, dynamicFilters] = await Promise.all([
    getAllCategoryProducts(),
    getAllBrands(),
    getCatalogCharacteristicFiltersCachedCore(),
  ]);

  if (!categories.success) {
    throw new Error(`[getCatalogFilters] categories failed: ${String(categories.error)}`);
  }

  if (!brands.success) {
    throw new Error(`[getCatalogFilters] brands failed: ${String(brands.error)}`);
  }

  const staticFilters = buildStaticFilters({
    categories: categories.data,
    brands: brands.data,
  });

  return withUniqueParams([...staticFilters, ...dynamicFilters]);
}

export const getCatalogFilters = async (): Promise<FilterGroup[]> => {
  if (isBuildPhase()) {
    return getBuildSafeFilters();
  }

  try {
    return await getCatalogFiltersCachedCore();
  } catch (error) {
    console.error("[getCatalogFilters] Failed to load catalog filters:", error);
    return getBuildSafeFilters();
  }
};
