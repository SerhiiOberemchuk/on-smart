import { user } from "@/auth-schema";

import { boolean, index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const userAddressesSchema = mysqlTable(
  "user_addresses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    label: varchar("label", { length: 64 }),

    nome: varchar("nome", { length: 128 }),
    cognome: varchar("cognome", { length: 128 }),
    numeroTelefono: varchar("numero_telefono", { length: 32 }),

    indirizzo: varchar("indirizzo", { length: 255 }).notNull(),
    numeroCivico: varchar("numero_civico", { length: 16 }).notNull(),
    citta: varchar("citta", { length: 128 }).notNull(),
    cap: varchar("cap", { length: 10 }).notNull(),
    provinciaRegione: varchar("provincia_regione", { length: 128 }).notNull(),
    nazione: varchar("nazione", { length: 2 }).notNull().default("IT"),

    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [index("user_addresses_userId_idx").on(t.userId)],
);

export type UserAddressType = typeof userAddressesSchema.$inferSelect;

export const userAddressesRelations = relations(userAddressesSchema, ({ one }) => ({
  user: one(user, {
    fields: [userAddressesSchema.userId],
    references: [user.id],
  }),
}));
