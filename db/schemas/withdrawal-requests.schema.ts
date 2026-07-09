import { user } from "@/auth-schema";
import { WITHDRAWAL_STATUS_LIST } from "@/types/withdrawal.types";

import { index, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";
import { ordersSchema } from "./orders.schema";

// Art. 54-bis Codice del Consumo (D.Lgs. 209/2025): online withdrawal
// statements. Rows are a legal record — order/user FKs use "set null" so the
// request survives if the referenced row is ever deleted; orderNumber, nome
// and email are stored as snapshots for the same reason.
export const withdrawalRequestsSchema = mysqlTable(
  "withdrawal_requests",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    orderId: varchar("order_id", { length: 36 }).references(() => ordersSchema.id, {
      onDelete: "set null",
    }),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),

    userId: varchar("user_id", { length: 36 }).references(() => user.id, {
      onDelete: "set null",
    }),

    nome: varchar("nome", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    message: text("message"),

    status: mysqlEnum("status", WITHDRAWAL_STATUS_LIST).notNull().default("RECEIVED"),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("withdrawal_requests_order_number_idx").on(t.orderNumber),
    index("withdrawal_requests_user_idx").on(t.userId),
  ],
);

export type WithdrawalRequestType = typeof withdrawalRequestsSchema.$inferSelect;

export const withdrawalRequestsRelations = relations(withdrawalRequestsSchema, ({ one }) => ({
  order: one(ordersSchema, {
    fields: [withdrawalRequestsSchema.orderId],
    references: [ordersSchema.id],
  }),
  user: one(user, {
    fields: [withdrawalRequestsSchema.userId],
    references: [user.id],
  }),
}));
