import { getProductBySlug } from "@/app/actions/product/get-product-by-slug";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import { getSupportProductById } from "@/app/actions/product/get-support-product-by-id";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getBrandBySlug } from "@/app/actions/brands/brand-actions";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import type { ProductType } from "@/db/schemas/product.schema";
import { baseUrl } from "@/types/baseUrl";
import { notFound } from "next/navigation";

function toAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeSlugLabel(value: unknown) {
  return typeof value === "string" ? value.replace(/[-_]+/g, " ").trim() : "";
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeImageList(values: unknown[]) {
  return values.filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
}

async function getVariantsForProduct(product: ProductType): Promise<ProductType[] | null> {
  if (product.parent_product_id && product.parent_product_id !== "NULL") {
    const parentResponse = await getProductById(product.parent_product_id);
    const parent = parentResponse.data;

    if (!parent) {
      return null;
    }

    const ids = Array.from(new Set([...(parent.variants ?? []), parent.id]));
    if (ids.length === 0) {
      return null;
    }

    const variantsResponse = await getProductsByIds(ids, { includeOutOfStock: true });
    const list = (variantsResponse.data ?? []) as ProductType[];
    return list.length > 0 ? list : null;
  }

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const ids = Array.from(new Set([...(product.variants ?? []), product.id]));
  const variantsResponse = await getProductsByIds(ids, { includeOutOfStock: true });
  const list = (variantsResponse.data ?? []) as ProductType[];
  return list.length > 0 ? list : null;
}

export default async function PageSlug({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: ProductType;
}) {
  const product = initialProduct ?? (await getProductBySlug(slug)).data;

  if (!product) {
    notFound();
  }

  const parentProductId =
    product.parent_product_id && product.parent_product_id !== "NULL" ? product.parent_product_id : null;
  const id = parentProductId ?? product.id;

  const [productDetails, supportProductsRaw, galleryResponse, brandResponse, variantsProduct] =
    await Promise.all([
      getProductDetailsById(id),
      getSupportProductById(id),
      getFotoFromGallery({ parent_product_id: id }),
      getBrandBySlug(product.brand_slug),
      getVariantsForProduct(product),
    ]);

  const supportProducts = supportProductsRaw.filter(
    (supportProduct) => supportProduct.id !== product.id && supportProduct.id !== id,
  );

  const galleryImages = galleryResponse.success ? (galleryResponse.data?.images ?? []) : [];
  const sliderImages = Array.from(new Set(normalizeImageList([product.imgSrc, ...galleryImages])));
  const brandDisplayName = brandResponse.data?.name || normalizeSlugLabel(product.brand_slug);
  const categoryDisplayName = normalizeSlugLabel(product.category_slug);
  const brandLogo =
    typeof brandResponse.data?.image === "string" && brandResponse.data.image.trim().length > 0
      ? brandResponse.data.image
      : "/logo.png";

  const productUrl = `${baseUrl}/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`;
  const categoryUrl = `${baseUrl}/categoria/${product.category_slug}`;
  const brandUrl = `${baseUrl}/brand/${product.brand_slug}`;
  const eanValue = normalizeOptionalText(product.ean);
  const productImages = sliderImages.map((url) => toAbsoluteUrl(url));
  const reviews = productDetails?.characteristics_valutazione ?? [];
  const reviewCount = reviews.length;
  const eanSchemaField = eanValue
    ? eanValue.length === 13
      ? { gtin13: eanValue }
      : eanValue.length === 14
        ? { gtin14: eanValue }
        : { gtin: eanValue }
    : {};

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    url: productUrl,
    name: product.name,
    image: productImages,
    description: product.nameFull,
    sku: product.id,
    productID: eanValue ?? product.id,
    mpn: product.id,
    category: categoryDisplayName,
    identifier: eanValue
      ? {
          "@type": "PropertyValue",
          propertyID: "EAN",
          value: eanValue,
        }
      : {
          "@type": "PropertyValue",
          propertyID: "SKU",
          value: product.id,
        },
    ...eanSchemaField,
    brand: {
      "@type": "Brand",
      name: brandDisplayName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: Number(product.price ?? 0),
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },

    ...(product.rating && reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount,
      },
    }),

    ...(reviewCount > 0 && {
      review: reviews.map((r) => ({
        "@type": "Review",
        author: r.client_name,
        reviewBody: r.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
        },
      })),
    }),
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Catalogo",
        item: `${baseUrl}/catalogo`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryDisplayName,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brandDisplayName,
        item: brandUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs category={product.category_slug} brand={product.brand_slug} productName={product.name} />
      <VisualProductSection
        product={product}
        images={sliderImages}
        brandLogo={brandLogo}
        brandName={brandDisplayName}
        variantsProduct={variantsProduct}
      />
      <ProductCharacteristicsSection product={product} productDetail={productDetails} />
      {supportProducts.length > 0 ? (
        <ProductRowListSection
          title="Acquistati insieme"
          productsList={supportProducts}
          idSection="page_product_insieme"
          isBottomLink={false}
        />
      ) : null}
      <script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        id="product-breadcrumbs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd),
        }}
      />
    </>
  );
}
