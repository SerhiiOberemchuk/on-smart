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

export const dashboardLinks = [
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.PRODUCTS,
    title: "Товари",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.BRANDS,
    title: "Бренди",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.CATEGORIES,
    title: "Категорії",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.CHARACTERISTICS,
    title: "Характеристики",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.BANNERS,
    title: "Банери",
    active: false,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.STOCK,
    title: "Склад",
    active: false,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS,
    title: "Замовлення",
    active: true,
  },
  {
    href: URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.PAYMENTS,
    title: "Оплати",
    active: true,
  },
] as const;