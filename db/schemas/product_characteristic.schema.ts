import { boolean, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productCharacteristicsSchema = mysqlTable("product_characteristics", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid())
    .unique(),
  category_id: varchar("category_id", { length: 36 }),
  name: varchar("name", { length: 255 }).notNull(),
  is_required: boolean("is_required").notNull().default(false),
  is_multiple: boolean("is_multiple").notNull().default(false),
  in_filter: boolean("in_filter").notNull().default(false),
});

export type ProductCharacteristicType = typeof productCharacteristicsSchema.$inferSelect;
