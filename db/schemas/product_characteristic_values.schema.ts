import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productCharacteristicValuesSchema = mysqlTable("product_characteristic_values", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => ulid())
    .notNull(),

  characteristic_id: varchar("characteristic_id", { length: 36 }).notNull(),

  value: varchar("value", { length: 255 }).notNull(),
  // "2MP", "4MP", "8MP", "Si", "No", "Wi-Fi", "Cablaggio"
});

export type ProductCharacteristicValuesType = typeof productCharacteristicValuesSchema.$inferSelect;
