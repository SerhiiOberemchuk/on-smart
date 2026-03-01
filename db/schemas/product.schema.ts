import {
  mysqlTable,
  varchar,
  int,
  json,
  decimal,
  index,
  uniqueIndex,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productsSchema = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    brand_slug: varchar("brand_slug", { length: 255 }).notNull(),
    category_slug: varchar("category_slug", { length: 255 }).notNull(),
    category_id: varchar("category_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    nameFull: varchar("name_full", { length: 255 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
    rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
    ean: varchar("ean", { length: 14 }).notNull().default("123456789012"),
    lengthCm: decimal("length_cm", { precision: 8, scale: 2 }).notNull().default("0"),
    widthCm: decimal("width_cm", { precision: 8, scale: 2 }).notNull().default("0"),
    heightCm: decimal("height_cm", { precision: 8, scale: 2 }).notNull().default("0"),
    weightKg: decimal("weight_kg", { precision: 8, scale: 3 }).notNull().default("0"),
    inStock: int("in_stock").notNull(),
    isOnOrder: boolean("is_on_order").default(false).notNull(),
    imgSrc: json("imgSrc").$type<string>().notNull(),
    productType: mysqlEnum("product_type", ["product", "bundle"]).notNull().default("product"),
    hasVariants: boolean("has_variants").default(false).notNull(),
    variants: json("variants").$type<string[]>(),
    relatedProductIds: json("related_product_ids").$type<string[]>(),
    parent_product_id: varchar("parent_product_id", { length: 36 }),
    bundleIds: json("bundle_ids").$type<string[]>(),
  },
  (table) => [
    uniqueIndex("product_slug_unique").on(table.slug),
    index("slug_category").on(table.category_slug),
    index("slug_brand").on(table.brand_slug),
    index("product_type_idx").on(table.productType),
  ],
);

export type ProductType = typeof productsSchema.$inferSelect;
export type ProductInsertType = typeof productsSchema.$inferInsert;
