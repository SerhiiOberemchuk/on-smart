import { mysqlTable, varchar, text, int, json, decimal, serial } from "drizzle-orm/mysql-core";

export const productsSchema = mysqlTable("products", {
  id: serial("id").primaryKey(),

  brand: varchar("brand", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 255 }).notNull(),

  price: int("price").notNull(),
  oldPrice: int("old_price"),

  quantity: int("quantity").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  inStock: int("in_stock").default(0).notNull(),

  imgSrc: text("img_src").notNull(),
  images: json("images").$type<string[]>(),
  logo: text("logo"),

  variants: json("variants").$type<{ id: string }[]>(),
});

export type Product = typeof productsSchema.$inferSelect;
export type NewProduct = typeof productsSchema.$inferInsert;
