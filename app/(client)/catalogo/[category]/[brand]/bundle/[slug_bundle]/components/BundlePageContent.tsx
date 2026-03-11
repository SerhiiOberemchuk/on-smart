import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import { getProductSpecificheById } from "@/app/actions/product-specifiche/get-product-specifiche";
import Breadcrumbs from "@/components/Breadcrumbs";
import { baseUrl } from "@/types/baseUrl";
import { redirect } from "next/navigation";
import BundleDetailsTabsSection from "./BundleDetailsTabsSection";
import BundleHeroSection from "./BundleHeroSection";
import BundleStructuredData from "./BundleStructuredData";
import type { BundlePageData, BundlePageParams, IncludedBundleProduct } from "./bundle-page.types";
import {
  getBundleAvailability,
  mapBundleToProduct,
  normalizeBundleDocuments,
  normalizeIncludedProductCharacteristics,
  normalizeIncludedProducts,
  normalizeBundleReviews,
  toNumber,
} from "./bundle-page.utils";

export default async function BundlePageContent({
  params,
  bundle,
}: {
  params: BundlePageParams;
  bundle: BundlePageData;
}) {
  const { category, brand } = await params;
  const canonicalPath = `/catalogo/${bundle.category_slug}/${bundle.brand_slug}/bundle/${bundle.slug}`;

  if (category !== bundle.category_slug || brand !== bundle.brand_slug) {
    redirect(canonicalPath);
  }

  const includedProductsMeta = normalizeIncludedProducts(bundle);
  const productIds = includedProductsMeta.map((item) => item.productId);
  const documents = normalizeBundleDocuments(bundle.bundleMeta?.documents);
  const reviews = normalizeBundleReviews(bundle.bundleMeta?.reviews);

  const [productsResponse, galleryResponse, specificheResponses] = await Promise.all([
    productIds.length > 0
      ? getProductsByIds(productIds, { includeOutOfStock: true })
      : { data: [] },
    getFotoFromGallery({ parent_product_id: bundle.id }),
    Promise.all(productIds.map((productId) => getProductSpecificheById(productId))),
  ]);

  const productById = new Map((productsResponse.data ?? []).map((item) => [item.id, item]));
  const specificheByProductId = new Map(
    productIds.map((productId, index) => [
      productId,
      specificheResponses[index]?.success ? specificheResponses[index].data : null,
    ]),
  );

  const includedProducts = includedProductsMeta
    .map((meta) => {
      const product = productById.get(meta.productId);
      if (!product) return null;
      const specifiche = specificheByProductId.get(meta.productId) ?? null;
      return {
        product,
        quantity: meta.quantity,
        shortDescription: meta.shortDescription,
        characteristicTitle: specifiche?.title?.trim() || "Caratteristiche",
        characteristics: normalizeIncludedProductCharacteristics(specifiche),
      };
    })
    .filter(Boolean) as IncludedBundleProduct[];

  const galleryImages =
    galleryResponse.success && galleryResponse.data ? galleryResponse.data.images : [];
  const sliderImages = Array.from(new Set([bundle.imgSrc, ...galleryImages].filter(Boolean)));
  const bundleAsProduct = mapBundleToProduct(bundle);
  const availability = getBundleAvailability(bundle);
  const currentPrice = toNumber(bundle.price);
  const oldPrice = toNumber(bundle.oldPrice);
  const discountValue = oldPrice > currentPrice ? oldPrice - currentPrice : 0;
  const discountPercent =
    oldPrice > currentPrice ? Math.round((discountValue / oldPrice) * 100) : 0;
  const advantages = (bundle.bundleMeta?.advantages ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  const bundleDescription = (bundle.bundleMeta?.description ?? "").trim();
  const bundleDescriptionForSeo = bundleDescription.replace(/\s+/g, " ").trim();
  const approvedReviews = reviews
    .map((item) => ({
      ...item,
      client_name: item.client_name?.trim() ?? "",
      comment: item.comment?.trim() ?? "",
      rating: Math.min(5, Math.max(1, Math.round(toNumber(item.rating)))),
      created_at: item.created_at?.trim() ?? "",
    }))
    .filter((item) => item.client_name.length > 0 && item.comment.length > 0);

  const absoluteBundleUrl = `${baseUrl}${canonicalPath}`;
  const bundleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.name,
    description: bundleDescriptionForSeo || bundle.nameFull,
    sku: bundle.id,
    productID: bundle.ean,
    category: bundle.category_name,
    brand: {
      "@type": "Brand",
      name: bundle.brand_name,
    },
    image: sliderImages,
    offers: {
      "@type": "Offer",
      url: absoluteBundleUrl,
      priceCurrency: "EUR",
      price: Number(bundle.price ?? 0),
      availability: availability.schema,
    },
    ...(approvedReviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue:
              approvedReviews.reduce((acc, item) => acc + item.rating, 0) / approvedReviews.length,
            reviewCount: approvedReviews.length,
          },
          review: approvedReviews.map((item) => ({
            "@type": "Review",
            author: item.client_name,
            reviewBody: item.comment,
            reviewRating: {
              "@type": "Rating",
              ratingValue: item.rating,
              bestRating: 5,
            },
          })),
        }
      : {}),
  };

  return (
    <>
      <Breadcrumbs
        category={bundle.category_slug}
        brand={bundle.brand_slug}
        productName={bundle.nameFull}
      />
      <BundleHeroSection
        bundle={bundle}
        bundleAsProduct={bundleAsProduct}
        sliderImages={sliderImages}
        availability={availability}
        discountValue={discountValue}
        discountPercent={discountPercent}
        bundleDescription={bundleDescription}
        advantages={advantages}
      />
      <BundleDetailsTabsSection
        includedProducts={includedProducts}
        bundleId={bundle.id}
        bundleName={bundle.nameFull}
        bundleRating={bundle.rating}
        documents={documents}
        reviews={reviews}
      />
      <BundleStructuredData data={bundleJsonLd} />
    </>
  );
}
