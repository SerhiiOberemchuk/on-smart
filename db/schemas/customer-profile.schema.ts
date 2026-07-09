import { user } from "@/auth-schema";
import { CLIENT_TYPE_LIST, DELIVERY_METHOD_LIST } from "@/types/orders.types";
import { PAYMENT_PROVIDER_LIST } from "@/types/payments.types";

import {
  boolean,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const customerProfilesSchema = mysqlTable(
  "customer_profiles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    numeroTelefono: varchar("numero_telefono", { length: 32 }),

    clientType: mysqlEnum("client_type", CLIENT_TYPE_LIST).notNull().default("privato"),

    nome: varchar("nome", { length: 128 }),
    cognome: varchar("cognome", { length: 128 }),

    codiceFiscale: varchar("codice_fiscale", { length: 32 }),
    referenteContatto: varchar("referente_contatto", { length: 128 }),
    ragioneSociale: varchar("ragione_sociale", { length: 255 }),
    partitaIva: varchar("partita_iva", { length: 16 }),
    pecAzzienda: varchar("pec_azzienda", { length: 255 }),
    codiceUnico: varchar("codice_unico", { length: 16 }),

    defaultPaymentMethod: mysqlEnum("default_payment_method", PAYMENT_PROVIDER_LIST),
    defaultDeliveryMethod: mysqlEnum("default_delivery_method", DELIVERY_METHOD_LIST)
      .notNull()
      .default("CONSEGNA_CORRIERE"),
    requestInvoiceDefault: boolean("request_invoice_default").notNull().default(false),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [uniqueIndex("customer_profiles_userId_uq").on(t.userId)],
);

export type CustomerProfileType = typeof customerProfilesSchema.$inferSelect;

export const customerProfilesRelations = relations(customerProfilesSchema, ({ one }) => ({
  user: one(user, {
    fields: [customerProfilesSchema.userId],
    references: [user.id],
  }),
}));
