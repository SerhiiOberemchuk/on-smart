import { int, json, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productDescrizioneSchema = mysqlTable("product_descrizione", {
  product_id: varchar("product_id", { length: 36 }).notNull(),
  images: json("images").$type<string[]>().notNull().default([]),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
});

export const productSpecificheSchema = mysqlTable("product_specifiche", {
  product_id: varchar("product_id", { length: 36 }).notNull(),
  images: json("images").$type<string[]>().notNull().default([]),
  title: varchar("title", { length: 255 }).notNull(),
  description: json("description")
    .$type<
      {
        title: string;
        items: { name: string; value: string }[];
      }[]
    >()
    .notNull()
    .default([]),
});

export const productValutazioneSchema = mysqlTable("product_valutazione", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  product_id: varchar("product_id", { length: 191 }).notNull(),
  clientName: varchar("clientName", { length: 191 }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment").notNull(),
  date: varchar("date", { length: 30 }).notNull(),
});

export type ProductDescriptionType = typeof productDescrizioneSchema.$inferSelect;
