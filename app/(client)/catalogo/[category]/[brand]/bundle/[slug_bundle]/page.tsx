import { getBundleBySlug } from "@/app/actions/bundles/get-bundle-by-slug";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
import ProductSlider from "@/components/ProductPageSections/VisualTopSection/ProductSlider";
import type { ProductType } from "@/db/schemas/product.schema";
import { baseUrl } from "@/types/baseUrl";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";
import BundleAddToCartButton from "./BundleAddToCartButton";

type BundlePageParams = Promise<{
  category: string;
  brand: string;
  slug_bundle: string;
}>;

type BundlePageData = NonNullable<Awaited<ReturnType<typeof getBundleBySlug>>["data"]>;

type IncludedProductView = {
  productId: string;
  quantity: number;
  shortDescription: string;
};

function mapBundleToProduct(bundle: BundlePageData): ProductType {
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

function normalizeIncludedProducts(bundle: BundlePageData): IncludedProductView[] {
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

function getBundleAvailability(bundle: BundlePageData) {
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

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function generateMetadata({
  params,
}: {
  params: BundlePageParams;
}): Promise<Metadata> {
  const { slug_bundle } = await params;
  const bundleResponse = await getBundleBySlug(slug_bundle);

  if (!bundleResponse.success || !bundleResponse.data) {
    notFound();
  }

  const bundle = bundleResponse.data;
  const eanValue = bundle.ean?.trim();
  const imageUrl = bundle.imgSrc.startsWith("http")
    ? bundle.imgSrc
    : `${baseUrl}${bundle.imgSrc.startsWith("/") ? bundle.imgSrc : `/${bundle.imgSrc}`}`;
  const canonicalUrl = `${baseUrl}/catalogo/${bundle.category_slug}/${bundle.brand_slug}/bundle/${bundle.slug}`;
  const bundleDescription = (bundle.bundleMeta?.description ?? "").replace(/\s+/g, " ").trim();
  const descriptionWithEan = eanValue
    ? `${bundleDescription || bundle.nameFull}. Brand: ${bundle.brand_name}. Categoria: ${bundle.category_name}. EAN: ${eanValue}.`.trim()
    : `${bundleDescription || bundle.nameFull}. Brand: ${bundle.brand_name}. Categoria: ${bundle.category_name}.`.trim();
  const keywordCandidates = [
    bundle.name,
    bundle.nameFull,
    bundle.brand_name,
    bundle.category_name,
    bundle.slug.replace(/[-_]+/g, " ").trim(),
    "bundle",
    "kit",
    eanValue ? `EAN ${eanValue}` : undefined,
    eanValue,
    ...(bundle.bundleMeta?.advantages ?? []),
  ].filter(Boolean) as string[];
  const keywords = Array.from(new Set(keywordCandidates));
  const description =
    descriptionWithEan ||
    `${bundle.nameFull}. Bundle ${bundle.brand_name} nella categoria ${bundle.category_name}.`;

  return {
    title: `${bundle.name} | Kit ${bundle.brand_name} ${eanValue ? `| EAN ${eanValue}` : ""}`.trim(),
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: bundle.name,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: bundle.nameFull,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.name,
      description,
      images: [imageUrl],
    },
    other: eanValue ? { "product:ean": eanValue } : undefined,
  };
}

async function BundlePageContent({ params }: { params: BundlePageParams }) {
  const { category, brand, slug_bundle } = await params;
  const bundleResponse = await getBundleBySlug(slug_bundle);

  if (!bundleResponse.success || !bundleResponse.data) {
    notFound();
  }

  const bundle = bundleResponse.data;
  const canonicalPath = `/catalogo/${bundle.category_slug}/${bundle.brand_slug}/bundle/${bundle.slug}`;

  if (category !== bundle.category_slug || brand !== bundle.brand_slug) {
    redirect(canonicalPath);
  }

  const includedProductsMeta = normalizeIncludedProducts(bundle);
  const productIds = includedProductsMeta.map((item) => item.productId);

  const [productsResponse, galleryResponse] = await Promise.all([
    productIds.length > 0
      ? getProductsByIds(productIds, { includeOutOfStock: true })
      : { data: [] },
    getFotoFromGallery({ parent_product_id: bundle.id }),
  ]);

  const productById = new Map((productsResponse.data ?? []).map((item) => [item.id, item]));
  const includedProducts = includedProductsMeta
    .map((meta) => {
      const product = productById.get(meta.productId);
      if (!product) return null;
      return {
        product,
        quantity: meta.quantity,
        shortDescription: meta.shortDescription,
      };
    })
    .filter(Boolean) as Array<{
    product: ProductType;
    quantity: number;
    shortDescription: string;
  }>;

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
  };

  return (
    <>
      <Breadcrumbs
        category={bundle.category_slug}
        brand={bundle.brand_slug}
        productName={bundle.nameFull}
      />

      <section>
        <div className="flex flex-col items-center gap-5 pt-3 pb-6 md:container xl:flex-row xl:items-start xl:pb-3">
          <ProductSlider
            product={bundleAsProduct}
            images={sliderImages}
            brandLogo={bundle.brand_image}
            brandName={bundle.brand_name}
          />
          <div className="w-full px-4 md:px-0 xl:flex-1">
            <div className="w-full rounded-sm bg-background p-3">
              <span className="helper_text inline-flex rounded-sm bg-yellow-500 px-2 py-1 text-black">
                Kit
              </span>
              <h1 className="H3 mt-4">{bundle.nameFull}</h1>
              <p className="helper_text mt-2 text-text-grey capitalize">
                {bundle.category_name} / {bundle.brand_name}
              </p>

              <div className="mt-4">
                <PricesBox
                  price={bundle.price}
                  oldPrice={bundle.oldPrice}
                  place="dialog-cart-product-footer"
                />
              </div>

              {discountValue > 0 ? (
                <p className="helper_text mt-2 text-yellow-500">
                  Risparmi {discountValue.toFixed(2)} EUR ({discountPercent}%)
                </p>
              ) : null}

              <p className={`helper_text mt-3 ${availability.className}`}>{availability.label}</p>

              <BundleAddToCartButton
                bundleId={bundle.id}
                inStock={bundle.inStock}
                disabled={bundle.inStock <= 0 && !bundle.isOnOrder}
              />

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-text-grey md:grid-cols-2">
                <p>EAN: {bundle.ean}</p>
                <p>
                  Dimensioni (cm): {bundle.lengthCm} x {bundle.widthCm} x {bundle.heightCm}
                </p>
                <p>Peso (kg): {bundle.weightKg}</p>
              </div>

              {bundleDescription ? (
                <div className="mt-4 border-t border-stroke-grey pt-4">
                  <h2 className="H4">Descrizione del Kit</h2>
                  <p className="text_R mt-2 whitespace-pre-line text-text-grey">
                    {bundleDescription}
                  </p>
                </div>
              ) : null}
            </div>
            {advantages.length > 0 ? (
              <section className="mt-4 mb-6">
                <div className="rounded-sm border border-yellow-500/40 bg-yellow-500/8 p-4 md:p-6">
                  <h2 className="H4">Vantaggi del Kit</h2>
                  <ul className="mt-3 flex flex-col gap-2">
                    {advantages.map((item, index) => (
                      <li key={`${item}-${index}`} className="body_R_20 flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container my-6">
        <div className="rounded-sm bg-background p-4 md:p-6">
          <h2 className="H4">Cosa include il Kit</h2>
          {includedProducts.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {includedProducts.map(({ product, quantity, shortDescription }) => (
                <li key={product.id} className="rounded-sm border border-stroke-grey p-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`}
                      className="block shrink-0"
                    >
                      <Image
                        src={product.imgSrc}
                        alt={product.nameFull}
                        width={88}
                        height={88}
                        className="aspect-square rounded-sm border border-stroke-grey object-contain p-1"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`}
                        className="body_R_20 line-clamp-2 hover:text-yellow-500"
                      >
                        {product.nameFull}
                      </Link>
                      <p className="helper_text mt-2 text-text-grey">Quantita: {quantity}</p>
                      <p className="helper_text mt-1 text-text-grey">Prezzo: {product.price} EUR</p>
                      {shortDescription ? (
                        <p className="text_R mt-2 line-clamp-3 text-text-grey">
                          {shortDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text_R mt-3 text-text-grey">
              Non sono stati trovati prodotti inclusi in questo kit.
            </p>
          )}
        </div>
      </section>

      <Script
        id="bundle-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bundleJsonLd),
        }}
      />
    </>
  );
}

export default function BundleSlugPage({ params }: { params: BundlePageParams }) {
  return (
    <Suspense fallback={<p>Caricamento...</p>}>
      <BundlePageContent params={params} />
    </Suspense>
  );
}
