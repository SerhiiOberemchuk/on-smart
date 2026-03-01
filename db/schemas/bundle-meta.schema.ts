import { json, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export type BundleMetaIncludedProduct = {
  productId: string;
  quantity: number;
  shortDescription: string;
};

export const bundleMetaSchema = mysqlTable("bundle_meta", {
  bundle_id: varchar("bundle_id", { length: 36 }).notNull().primaryKey(),
  includedProducts: json("included_products")
    .$type<BundleMetaIncludedProduct[]>()
    .notNull()
    .default([]),
  advantages: json("advantages").$type<string[]>().notNull().default([]),
  description: text("description").notNull().default(""),
});

export type BundleMetaType = typeof bundleMetaSchema.$inferSelect;
export type BundleMetaInsertType = typeof bundleMetaSchema.$inferInsert;
