import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { ulid } from "ulid";

export const categoryProductsSchema = mysqlTable("categories_products", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }).notNull(),
  title_full: varchar("title_full", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 1024 }).notNull(),
  category_slug: varchar("category_slug", { length: 255 }).notNull(),
});
