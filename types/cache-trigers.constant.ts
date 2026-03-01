export const CACHE_TAGS = {
  product: {
    all: "get_all_product",
    topSales: "top-sales-products",
    byId: (id: string) => `product_id_${id}`,
    bySlug: (slug: string) => `product_slug_${slug}`,
    byIds: (ids: string[]) => `products_by_ids_${ids.join("_")}`,
    supportById: (id: string) => `support_products_${id}`,
    reviewsById: (id: string) => `product_review_${id}`,
    details: {
      all: "product_details_by_id",
      byId: (id: string) => `product_details_${id}`,
    },
  },
  bundle: {
    all: "get_all_bundles",
    bySlug: (slug: string) => `bundle_slug_${slug}`,
    byId: (id: string) => id,
  },
  bundleMeta: {
    byBundleId: (id: string) => `bundle_meta_${id}`,
  },
  brand: {
    all: "all_brands",
    bySlug: (slug: string) => slug,
  },
  category: {
    all: "all_categories",
    bySlug: (slug: string) => slug,
    byId: (id: string) => `category:${id}`,
  },
  gallery: {
    byParentProductId: (id: string) => id,
  },
  catalog: {
    filters: "catalog-filters",
    characteristicFilters: "catalog-filters-characteristics",
  },
  characteristics: {
    allWithMeta: "getAllCharacteristicsWithMeta",
  },
  orders: {
    info: "CACHE_TAG_GET_ORDER_INFO",
    byId: (id: string) => id,
  },
} as const;

export const CACHE_TRIGGERS_TAGS = {
  product: {
    list: CACHE_TAGS.product.all,
    detailsById: CACHE_TAGS.product.details.byId,
    byId: CACHE_TAGS.product.byId,
    PRODUCT_DETAILS_BY_ID: CACHE_TAGS.product.details.all,
    specifiche: (id: string) => `product:${id}:specifiche`,
    characteristics: (id: string) => `product:${id}:characteristics`,
    images: (id: string) => `product:${id}:images`,
  },

  category: {
    byId: CACHE_TAGS.category.byId,
  },
} as const;
