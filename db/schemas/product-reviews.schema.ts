import { mysqlTable, varchar, int, text, boolean, timestamp } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const productReviewsSchema = mysqlTable("product_reviews", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),

  product_id: varchar("product_id", { length: 36 }).notNull(),

  client_name: varchar("client_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),

  rating: int("rating").notNull(),
  comment: text("comment").notNull(),

  is_approved: boolean("is_approved").default(false),

  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type ProductReviewType = typeof productReviewsSchema.$inferSelect;
