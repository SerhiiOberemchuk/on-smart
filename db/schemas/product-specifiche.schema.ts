import { mysqlTable, varchar, json } from "drizzle-orm/mysql-core";

export const productSpecificheSchema = mysqlTable("product_specifiche", {
  product_id: varchar("product_id", { length: 36 }).notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  images: json("images").$type<string[]>().notNull().default([]),
  groups: json("groups")
    .$type<
      {
        groupTitle: string;
        items: { name: string; value: string }[];
      }[]
    >()
    .notNull()
    .default([]),
});

export type ProductSpecificheType = typeof productSpecificheSchema.$inferSelect;
