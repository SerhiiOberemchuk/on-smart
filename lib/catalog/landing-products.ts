import { getAllProductsFiltered } from "@/app/actions/product/get-all-products-filtered";

const LANDING_PRODUCTS_LIMIT = 24;

// The brand/category page and its generateMetadata must pass the SAME payload:
// "use cache" keys on the arguments, so both share one entry and the metadata
// indexability check (buildLandingPageRobots) costs no extra query.
export function getBrandLandingProducts(brandSlug: string) {
  return getAllProductsFiltered({
    brandSlugs: [brandSlug],
    mode: "parentsOnly",
    limit: LANDING_PRODUCTS_LIMIT,
    sort: "new",
  });
}

export function getCategoryLandingProducts(categorySlug: string) {
  return getAllProductsFiltered({
    categorySlugs: [categorySlug],
    mode: "parentsOnly",
    limit: LANDING_PRODUCTS_LIMIT,
    sort: "new",
  });
}
