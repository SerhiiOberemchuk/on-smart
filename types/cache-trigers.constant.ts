export const CACHE_TRIGGERS_TAGS = {
  product: {
    list: "product:list",
    detailsById: (id: string) => `product_details_${id}`,
    byId: (id: string) => `product:${id}`,
    PRODUCT_DETAILS_BY_ID: "product_details_by_id",
    specifiche: (id: string) => `product:${id}:specifiche`,
    characteristics: (id: string) => `product:${id}:characteristics`,
    images: (id: string) => `product:${id}:images`,
  },

  category: {
    byId: (id: string) => `category:${id}`,
  },
} as const;
