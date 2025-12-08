import { FilterOption } from "@/types/catalog-filter-options.types";
import { int, json, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const filtersSchema = mysqlTable("filters", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => ulid())
    .notNull(),
  param: varchar("param", { length: 32 }).notNull(),
  title: varchar("title", { length: 32 }).notNull(),
  type: json("type").$type<"checkbox" | "range" | "radio">().notNull(),
  options: json("options").$type<FilterOption[]>(),
  min: int("min"),
  max: int("max"),
});
