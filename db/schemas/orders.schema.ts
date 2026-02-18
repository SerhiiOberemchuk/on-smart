import { ClientType, ORDER_STATUS_LIST } from "@/types/orders.types";
import { PAYMENT_PROVIDER_LIST, PAYMENT_STATUS_LIST } from "@/types/payments.types";
import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const ordersSchema = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),
    userId: varchar("userId", { length: 36 }),
    orderNumber: text("orderNumber").notNull(),
    clientType: text("clientType").$type<ClientType>().notNull(),
    email: text("email").notNull(),
    numeroTelefono: text("numeroTelefono").notNull(),
    nome: text("nome"),
    cognome: text("cognome"),
    indirizzo: text("indirizzo"),
    numeroCivico: text("numeroCivico"),
    citta: text("citta"),
    cap: text("cap"),
    nazione: text("nazione"),
    provinciaRegione: text("provinciaRegione"),
    codiceFiscale: text("codiceFiscale"),
    referenteContatto: text("referenteContatto"),
    ragioneSociale: text("ragioneSociale"),
    partitaIva: text("partitaIva"),
    requestInvoice: text("requestInvoice"),
    pecAzzienda: text("pecAzzienda"),
    codiceUnico: text("codiceUnico"),
    paymentOrderID: text("paymentOrderID"),
    orderStatus: mysqlEnum("orderStatus", ORDER_STATUS_LIST).notNull().default("PENDING_PAYMENT"),
    paymentStatus: mysqlEnum("paymentStatus", PAYMENT_STATUS_LIST).notNull().default("CREATED"),
    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    sameAsBilling: boolean("sameAsBilling").notNull(),
    deliveryMethod: text("deliveryMethod", {
      enum: ["consegna_corriere", "ritiro_negozio"],
    }).notNull(),
    productsList: json("productsList").$type<
      {
        productName: string;
        productQnt: number;
        productId: string;
      }[]
    >(),
    deliveryPrice: int("deliveryPrice").notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("orders_orderNumber_idx").on(t.orderNumber),
    index("orders_userId_idx").on(t.userId),
    index("orders_email_idx").on(t.email),
  ],
);

export type orderChecoutTypes = typeof ordersSchema.$inferInsert;

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),

    userId: varchar("userId", { length: 36 }),

    orderNumber: varchar("orderNumber", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }),

    status: mysqlEnum("status", ORDER_STATUS_LIST).notNull().default("PENDING_PAYMENT"),

    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),

    subtotal: int("subtotal").notNull(),
    shippingTotal: int("shippingTotal").notNull().default(0),
    discountTotal: int("discountTotal").notNull().default(0),
    taxTotal: int("taxTotal").notNull().default(0),
    grandTotal: int("grandTotal").notNull(),

    deliveryMethod: varchar("deliveryMethod", { length: 32 }).notNull(), // "corriere" | "ritiro"
    shippingPreferenceNoShipping: boolean("shippingPreferenceNoShipping").notNull().default(false),

    billing: json("billing")
      .$type<{
        type: "privato" | "azienda";
        nome?: string;
        cognome?: string;
        ragioneSociale?: string;
        partitaIva?: string;
        codiceFiscale?: string;
        pec?: string;
        codiceUnico?: string;
        address?: {
          line1: string;
          line2?: string;
          city: string;
          postalCode: string;
          province?: string;
          country: string;
        };
      }>()
      .notNull(),

    shipping: json("shipping").$type<null | {
      nome?: string;
      cognome?: string;
      phone?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        postalCode: string;
        province?: string;
        country: string;
      };
    }>(),

    notes: text("notes"),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("orders_orderNumber_idx").on(t.orderNumber),
    index("orders_userId_idx").on(t.userId),
    index("orders_email_idx").on(t.email),
  ],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),
    orderId: varchar("orderId", { length: 36 }).notNull(),

    productId: varchar("productId", { length: 36 }),
    variantId: varchar("variantId", { length: 36 }),

    sku: varchar("sku", { length: 64 }),
    quantity: int("quantity").notNull(),

    unitPrice: int("unitPrice").notNull(),
    lineTotal: int("lineTotal").notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    brandName: varchar("brandName", { length: 128 }),
    categoryName: varchar("categoryName", { length: 128 }),
    imageUrl: text("imageUrl"),

    createdAt: timestamp("createdAt", { fsp: 3 }).notNull().defaultNow(),
  },
  (t) => [
    index("order_items_orderId_idx").on(t.orderId),
    index("order_items_productId_idx").on(t.productId),
    index("order_items_brandName_idx").on(t.brandName),
  ],
);
export const payments = mysqlTable(
  "payments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),
    orderId: varchar("orderId", { length: 36 }).notNull(),

    provider: mysqlEnum("provider", PAYMENT_PROVIDER_LIST).notNull(),
    status: mysqlEnum("status", PAYMENT_STATUS_LIST).notNull().default("CREATED"),

    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    amount: int("amount").notNull(),

    providerOrderId: varchar("providerOrderId", { length: 128 }),
    providerCaptureId: varchar("providerCaptureId", { length: 128 }),

    raw: text("raw"),

    createdAt: timestamp("createdAt", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    index("payments_orderId_idx").on(t.orderId),
    index("payments_providerOrderId_idx").on(t.providerOrderId),
  ],
);
