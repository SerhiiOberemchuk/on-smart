import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const brandProductsSchema = mysqlTable("brands_products", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }).notNull(),
  title_full: varchar("title_full", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 1024 }).notNull(),
  brand_slug: varchar("brand_slug", { length: 255 }).notNull(),
});
