import { brandProductsSchema } from "@/db/schemas/brand-products.schema";

export type BrandTypes = typeof brandProductsSchema.$inferInsert;
