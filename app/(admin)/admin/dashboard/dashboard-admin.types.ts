export const URL_DASHBOARD = {
  DASHBOARD: "/admin/dashboard",
  SUB_DASHBOARD: {
    PRODUCTS: "/products",
    BRANDS: "/brands",
    CATEGORIES: "/categories",
    CHARACTERISTICS: "/characteristics",
    BANNERS: "/banners",
    STOCK: "/stock",
    ORDERS: "/orders",
    PAYMENTS: "/payments",
  },
};

export type DashboardLinkIcon =
  | "products"
  | "brands"
  | "categories"
  | "characteristics"
  | "banners"
  | "stock"
  | "orders"
  | "payments";

export const dashboardLinks = [
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.PRODUCTS,
    title: "Товари",
    icon: "products",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.BRANDS,
    title: "Бренди",
    icon: "brands",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.CATEGORIES,
    title: "Категорії",
    icon: "categories",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.CHARACTERISTICS,
    title: "Характеристики",
    icon: "characteristics",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.BANNERS,
    title: "Банери",
    icon: "banners",
    active: false,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.STOCK,
    title: "Склад",
    icon: "stock",
    active: false,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS,
    title: "Замовлення",
    icon: "orders",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.PAYMENTS,
    title: "Оплати",
    icon: "payments",
    active: true,
  },
] satisfies ReadonlyArray<{
  href: string;
  title: string;
  icon: DashboardLinkIcon;
  active: boolean;
}>;
