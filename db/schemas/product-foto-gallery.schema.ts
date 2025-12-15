import { json, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const productFotoGallery = mysqlTable("product_gallery", {
  parent_product_id: varchar("parent_product_id", { length: 36 }).notNull(),
  images: json("images").$type<string[]>().notNull().default([]),
});

export type productFotoGallery = typeof productFotoGallery.$inferSelect;
