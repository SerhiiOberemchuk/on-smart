import {
  CLIENT_TYPE_LIST,
  CURRENCY_LIST,
  DELIVERY_METHOD_LIST,
  ORDER_STATUS_LIST,
} from "@/types/orders.types";
import { PAYMENT_PROVIDER_LIST, PAYMENT_STATUS_LIST } from "@/types/payments.types";

import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  foreignKey,
  json,
  decimal,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const ordersSchema = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().notNull(),

    userId: varchar("user_id", { length: 36 }),

    orderNumber: varchar("order_number", { length: 64 }).notNull().unique(),

    clientType: mysqlEnum("client_type", CLIENT_TYPE_LIST).notNull(),

    email: text("email").notNull(),
    numeroTelefono: text("numero_telefono").notNull(),

    nome: text("nome"),
    cognome: text("cognome"),

    indirizzo: text("indirizzo"),
    numeroCivico: text("numero_civico"),
    citta: text("citta"),
    cap: text("cap"),
    nazione: text("nazione"),
    provinciaRegione: text("provincia_regione"),

    codiceFiscale: text("codice_fiscale"),
    referenteContatto: text("referente_contatto"),

    ragioneSociale: text("ragione_sociale"),
    partitaIva: text("partita_iva"),

    requestInvoice: boolean("request_invoice").notNull().default(false),

    pecAzzienda: text("pec_azzienda"),
    codiceUnico: text("codice_unico"),

    paymentOrderID: text("payment_order_id"),

    orderStatus: mysqlEnum("order_status", ORDER_STATUS_LIST).notNull().default("PENDING_PAYMENT"),

    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),
    deliveryAdress: json("delivery_adress").$type<{
      cap: string;
      citta: string;
      indirizzo: string;
      nazione: string;
      partita_iva: string;
      provincia_regione: string;
      ragione_sociale: string;
      referente_contatto: string;
    }>(),

    shippedAt: timestamp("shipped_at", { fsp: 3 }),
    deliveredAt: timestamp("delivered_at", { fsp: 3 }),

    sameAsBilling: boolean("same_as_billing").notNull().default(true),

    deliveryMethod: mysqlEnum("delivery_method", DELIVERY_METHOD_LIST).notNull(),
    deliveryPrice: int("delivery_price").notNull(),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("orders_orderNumber_uq").on(t.orderNumber),
    index("orders_userId_idx").on(t.userId),
  ],
);

export type OrderTypes = typeof ordersSchema.$inferSelect;
// export type OrderTypesInferInsert = typeof ordersSchema.$inferInsert;

export const orderItemsSchema = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    orderId: varchar("order_id", { length: 36 }).notNull(),

    productId: varchar("product_id", { length: 36 }),

    quantity: int("quantity").notNull(),

    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    brandName: varchar("brand_name", { length: 128 }),
    categoryName: varchar("category_name", { length: 128 }),

    imageUrl: text("image_url"),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("order_items_orderId_idx").on(t.orderId),
    index("order_items_productId_idx").on(t.productId),
    index("order_items_brandName_idx").on(t.brandName),

    foreignKey({
      name: "order_items_orderId_fk",
      columns: [t.orderId],
      foreignColumns: [ordersSchema.id],
    }).onDelete("cascade"),
  ],
);

export type OrderItemsTypes = typeof orderItemsSchema.$inferSelect;

export const paymentsSchema = mysqlTable(
  "payments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    orderId: varchar("order_id", { length: 36 }).notNull(),
    orderNumber: varchar("order_number", { length: 64 }).notNull(),
    provider: mysqlEnum("provider", PAYMENT_PROVIDER_LIST).notNull(),
    status: mysqlEnum("status", PAYMENT_STATUS_LIST).notNull().default("CREATED"),

    currency: mysqlEnum("currency", CURRENCY_LIST).notNull().default("EUR"),

    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

    providerOrderId: varchar("provider_order_id", { length: 128 }),

    notes: text("notes"),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("payments_orderId_idx").on(t.orderId),
    index("payments_providerOrderId_idx").on(t.providerOrderId),

    uniqueIndex("payments_provider_providerOrderId_uq").on(t.provider, t.providerOrderId),

    foreignKey({
      name: "payments_orderId_fk",
      columns: [t.orderId],
      foreignColumns: [ordersSchema.id],
    }).onDelete("cascade"),
  ],
);

export type OrderPaymentTypes = typeof paymentsSchema.$inferSelect;

export const ordersRelations = relations(ordersSchema, ({ many }) => ({
  items: many(orderItemsSchema),
  payments: many(paymentsSchema),
}));

export const orderItemsRelations = relations(orderItemsSchema, ({ one }) => ({
  order: one(ordersSchema, {
    fields: [orderItemsSchema.orderId],
    references: [ordersSchema.id],
  }),
}));

export const paymentsRelations = relations(paymentsSchema, ({ one }) => ({
  order: one(ordersSchema, {
    fields: [paymentsSchema.orderId],
    references: [ordersSchema.id],
  }),
}));
