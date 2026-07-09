import { user } from "@/auth-schema";
import { productsSchema } from "@/db/schemas/product.schema";

import { index, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const wishlistItemsSchema = mysqlTable(
  "wishlist_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => productsSchema.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  },
  (t) => [
    index("wishlist_items_userId_idx").on(t.userId),
    uniqueIndex("wishlist_user_product_uq").on(t.userId, t.productId),
  ],
);

export type WishlistItemType = typeof wishlistItemsSchema.$inferSelect;

export const wishlistItemsRelations = relations(wishlistItemsSchema, ({ one }) => ({
  user: one(user, {
    fields: [wishlistItemsSchema.userId],
    references: [user.id],
  }),
  product: one(productsSchema, {
    fields: [wishlistItemsSchema.productId],
    references: [productsSchema.id],
  }),
}));
