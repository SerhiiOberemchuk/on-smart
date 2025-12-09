import { json, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const productDocumentsSchema = mysqlTable("product_documents", {
  product_id: varchar("product_id", { length: 36 }).notNull(),
  documents: json("documents").$type<{ title: string; link: string }[]>().notNull(),
});

export type ProductDocumentsType = typeof productDocumentsSchema.$inferInsert;
