import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";

export type CategoryTypes = typeof categoryProductsSchema.$inferInsert;
