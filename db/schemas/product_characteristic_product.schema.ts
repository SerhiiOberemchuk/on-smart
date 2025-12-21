import { mysqlTable, varchar, json, index } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productCharacteristicProductSchema = mysqlTable(
  "product_characteristic_product",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => ulid()),

    product_id: varchar("product_id", { length: 36 }).notNull(),
    characteristic_id: varchar("characteristic_id", { length: 36 }).notNull(),
    characteristic_name: varchar("characteristic_name", { length: 255 }).notNull(),
    value_ids: json("value_ids").$type<string[]>().notNull().default([]),
  },
  (t) => [
    index("idx_product").on(t.product_id),
    index("idx_characteristic").on(t.characteristic_id),
  ],
);

export type ProductCharacteristicProductType =
  typeof productCharacteristicProductSchema.$inferSelect;
