"use server";

import { and, asc, desc, gte, inArray, lte, sql } from "drizzle-orm";
import { productsSchema } from "@/db/schemas/product.schema";
import { productCharacteristicProductSchema } from "@/db/schemas/product_characteristic_product.schema";
import { db } from "@/db/db";
export type CatalogQueryPayload = {
  categorySlugs?: string[];
  brandSlugs?: string[];
  characteristics?: Record<string, string[]>;
  price?: {
    min?: number;
    max?: number;
  };
  sort?: "price-asc" | "price-desc" | "new";
  page?: number;
  limit?: number;
};

export async function getAllProductsFiltered(payload: CatalogQueryPayload) {
  "use cache";
  const {
    categorySlugs,
    brandSlugs,
    characteristics,
    price,
    sort = "new",
    page = 1,
    limit = 20,
  } = payload;

  const offset = (page - 1) * limit;

  const where = [];

  if (categorySlugs?.length) {
    where.push(inArray(productsSchema.category_slug, categorySlugs));
  }

  if (brandSlugs?.length) {
    where.push(inArray(productsSchema.brand_slug, brandSlugs));
  }
  if (price?.min !== undefined) {
    where.push(gte(productsSchema.price, price.min.toString()));
  }

  if (price?.max !== undefined) {
    where.push(lte(productsSchema.price, price.max.toString()));
  }

  if (characteristics && Object.keys(characteristics).length) {
    Object.values(characteristics).forEach((valueIds) => {
      where.push(
        sql`
          EXISTS (
            SELECT 1
            FROM ${productCharacteristicProductSchema}
            WHERE ${productCharacteristicProductSchema.product_id} = ${productsSchema.id}
            AND JSON_OVERLAPS(
              ${productCharacteristicProductSchema.value_ids},
              ${JSON.stringify(valueIds)}
            )
          )
        `,
      );
    });
  }

  const orderBy =
    sort === "price-asc"
      ? asc(productsSchema.price)
      : sort === "price-desc"
        ? desc(productsSchema.price)
        : desc(productsSchema.id);
  const data = await db
    .select()
    .from(productsSchema)
    .where(where.length ? and(...where) : undefined)
    .orderBy(orderBy)
    .limit(20)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(productsSchema)
    .where(where.length ? and(...where) : undefined);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
