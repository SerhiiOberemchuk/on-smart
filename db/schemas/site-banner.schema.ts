import { boolean, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

import { SITE_BANNER_ICON_LIST, SITE_BANNER_VARIANT_LIST } from "@/types/site-banner.types";

// Single global announcement bar shown under the header on every page.
// The store keeps a single row (a singleton); the admin edits it in place.
// When the row is inactive or the message is empty, nothing is rendered.
export const siteBannerSchema = mysqlTable("site_banner", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),

  message: text("message"),

  isActive: boolean("is_active").notNull().default(false),

  variant: mysqlEnum("variant", SITE_BANNER_VARIANT_LIST).notNull().default("info"),

  icon: mysqlEnum("icon", SITE_BANNER_ICON_LIST).notNull().default("megaphone"),

  linkUrl: varchar("link_url", { length: 500 }),
  linkLabel: varchar("link_label", { length: 120 }),

  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type SiteBannerType = typeof siteBannerSchema.$inferSelect;
