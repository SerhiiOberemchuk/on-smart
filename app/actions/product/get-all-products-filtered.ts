"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { productCharacteristicProductSchema } from "@/db/schemas/product_characteristic_product.schema";
import { and, asc, desc, gt, gte, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";

export type CatalogQueryPayload = {
  categorySlugs?: string[];
  brandSlugs?: string[];
  characteristics?: Record<string, string[]>;
  price?: { min?: number; max?: number };
  sort?: "price-asc" | "price-desc" | "new";
  page?: number;
  limit?: number;
  mode?: "parentsOnly" | "all";
};

export async function getAllProductsFiltered(payload: CatalogQueryPayload) {
  const {
    categorySlugs,
    brandSlugs,
    characteristics,
    price,
    sort = "new",
    page = 1,
    limit = 20,
    mode = "all",
  } = payload;

  const offset = (page - 1) * limit;

  const effectiveProductId = sql<string>`
    COALESCE(${productsSchema.parent_product_id}, ${productsSchema.id})
  `;

  const where: SQL<unknown>[] = [];
  where.push(gt(productsSchema.inStock, 0));
  if (mode === "parentsOnly") where.push(isNull(productsSchema.parent_product_id));
  if (categorySlugs?.length) where.push(inArray(productsSchema.category_slug, categorySlugs));
  if (brandSlugs?.length) where.push(inArray(productsSchema.brand_slug, brandSlugs));
  if (price?.min !== undefined) where.push(gte(productsSchema.price, price.min.toString()));
  if (price?.max !== undefined) where.push(lte(productsSchema.price, price.max.toString()));

  if (characteristics) {
    const valueGroups = Object.values(characteristics).filter(
      (ids): ids is string[] => Array.isArray(ids) && ids.length > 0,
    );

    for (const valueIds of valueGroups) {
      where.push(
        sql`
          EXISTS (
            SELECT 1
            FROM ${productCharacteristicProductSchema}
            WHERE ${productCharacteristicProductSchema.product_id} = ${effectiveProductId}
            AND JSON_OVERLAPS(
              ${productCharacteristicProductSchema.value_ids},
              ${JSON.stringify(valueIds)}
            )
          )
        `,
      );
    }
  }

  const whereClause = where.length ? and(...where) : undefined;
  const orderBy =
    sort === "price-asc"
      ? asc(productsSchema.price)
      : sort === "price-desc"
        ? desc(productsSchema.price)
        : desc(productsSchema.id);

  const data = await db
    .select()
    .from(productsSchema)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(productsSchema)
    .where(whereClause);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      mode,
      sort,
    },
  };
}
