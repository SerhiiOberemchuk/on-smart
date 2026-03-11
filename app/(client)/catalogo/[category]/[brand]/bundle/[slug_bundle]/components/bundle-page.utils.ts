import type { ProductType } from "@/db/schemas/product.schema";
import type { BundleMetaDocument, BundleMetaReview } from "@/db/schemas/bundle-meta.schema";
import type { ProductSpecificheType } from "@/db/schemas/product-specifiche.schema";
import type {
  BundleAvailability,
  BundlePageData,
  IncludedProductCharacteristic,
  IncludedProductView,
} from "./bundle-page.types";

export function mapBundleToProduct(bundle: BundlePageData): ProductType {
  return {
    id: bundle.id,
    slug: bundle.slug,
    brand_slug: bundle.brand_slug,
    category_slug: bundle.category_slug,
    category_id: bundle.category_id,
    name: bundle.name,
    nameFull: bundle.nameFull,
    price: bundle.price,
    oldPrice: bundle.oldPrice ?? null,
    rating: bundle.rating ?? "5.0",
    ean: bundle.ean,
    lengthCm: bundle.lengthCm,
    widthCm: bundle.widthCm,
    heightCm: bundle.heightCm,
    weightKg: bundle.weightKg,
    inStock: bundle.inStock,
    isOnOrder: bundle.isOnOrder,
    imgSrc: bundle.imgSrc || "/logo.svg",
    productType: "bundle",
    hasVariants: false,
    variants: [],
    relatedProductIds: [],
    parent_product_id: null,
    bundleIds: [],
  };
}

export function normalizeIncludedProducts(bundle: BundlePageData): IncludedProductView[] {
  const includedProducts = bundle.bundleMeta?.includedProducts ?? [];
  const includedById = new Map(includedProducts.map((item) => [item.productId, item]));
  const productIds = Array.from(new Set(includedProducts.map((item) => item.productId)));

  return productIds.map((productId) => {
    const includedItem = includedById.get(productId);
    const quantity = Number(includedItem?.quantity ?? 1);
    return {
      productId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
      shortDescription: includedItem?.shortDescription?.trim() ?? "",
    };
  });
}

export function getBundleAvailability(bundle: BundlePageData): BundleAvailability {
  if (bundle.inStock > 0) {
    return {
      label: `Disponibile per l'acquisto (${bundle.inStock} pz.)`,
      className: "text-green-500",
      schema: "https://schema.org/InStock",
    };
  }

  if (bundle.isOnOrder) {
    return {
      label: "Disponibile su ordinazione",
      className: "text-blue-400",
      schema: "https://schema.org/PreOrder",
    };
  }

  return {
    label: "Non disponibile",
    className: "text-red-400",
    schema: "https://schema.org/OutOfStock",
  };
}

export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseUnknownJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeBundleDocuments(value: unknown): BundleMetaDocument[] {
  return parseUnknownJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const title = String(raw.title ?? "").trim();
      const link = String(raw.link ?? "").trim();
      if (!title || !link) return null;
      return { title, link };
    })
    .filter(Boolean) as BundleMetaDocument[];
}

export function normalizeBundleReviews(value: unknown): BundleMetaReview[] {
  return parseUnknownJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const id = String(raw.id ?? "").trim();
      const clientName = String(raw.client_name ?? "").trim();
      const email = String(raw.email ?? "").trim();
      const comment = String(raw.comment ?? "").trim();
      const ratingRaw = Number(raw.rating);
      const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 5;
      const createdAt = String(raw.created_at ?? "").trim();
      if (!id || !clientName || !email || !comment) return null;
      return {
        id,
        client_name: clientName,
        email,
        rating,
        comment,
        created_at: createdAt,
      };
    })
    .filter(Boolean) as BundleMetaReview[];
}

export function normalizeIncludedProductCharacteristics(
  specifiche: ProductSpecificheType | null | undefined,
): IncludedProductCharacteristic[] {
  const groups = specifiche?.groups ?? [];
  return groups
    .map((item) => ({
      name: String(item?.name ?? "").trim(),
      value: String(item?.value ?? "").trim(),
      position: Number.isFinite(Number(item?.position)) ? Number(item?.position) : 0,
    }))
    .filter((item) => item.name.length > 0 && item.value.length > 0)
    .sort((a, b) => a.position - b.position);
}
