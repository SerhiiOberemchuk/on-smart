import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { FilterGroup } from "@/types/catalog-filter-options.types";

import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { productCharacteristicValuesSchema } from "@/db/schemas/product_characteristic_values.schema";
import { productCharacteristicsSchema } from "@/db/schemas/product_characteristic.schema";
import slugify from "@sindresorhus/slugify";

export const getCatalogFilters = async (): Promise<FilterGroup[]> => {
  "use cache";

  const categories = await getAllCategoryProducts();
  const brands = await getAllBrands();

  const staticFilters: FilterGroup[] = [
    {
      param: "categoria",
      title: "Categoria",
      type: "checkbox",
      options: categories.data.map((item) => ({
        value: item.category_slug,
        label: item.name,
      })),
    },
    {
      param: "brand",
      title: "Brand",
      type: "checkbox",
      options: brands.data.map((item) => ({
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

  const characteristics = await db
    .select()
    .from(productCharacteristicsSchema)
    .where(eq(productCharacteristicsSchema.in_filter, true));

  if (!characteristics.length) {
    return staticFilters;
  }

  const values = await db.select().from(productCharacteristicValuesSchema);

  const valuesMap = new Map<string, { value: string; label: string }[]>();

  for (const v of values) {
    if (!valuesMap.has(v.characteristic_id)) {
      valuesMap.set(v.characteristic_id, []);
    }

    valuesMap.get(v.characteristic_id)!.push({
      value: v.id,
      label: v.value,
    });
  }

  const dynamicFilters: FilterGroup[] = characteristics
    .map((c) => {
      const options = valuesMap.get(c.id) ?? [];

      if (!options.length) return null;

      return {
        param: slugify(c.name),
        title: c.name,
        type: "checkbox",
        options,
      } as FilterGroup;
    })
    .filter(Boolean) as FilterGroup[];

  return [...staticFilters, ...dynamicFilters];
};
