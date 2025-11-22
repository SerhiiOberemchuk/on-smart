import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import Image from "next/image";
import LinkYellow from "@/components/YellowLink";
import Breadcrumbs from "./Breadcrumbs";
import { getBrandInfo } from "@/app/actions/product/get-brand-info";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";

export default async function BrandPage({ brand }: { brand: string }) {
  const products = await getAllProducts({ brand });
  const brandInfo = await getBrandInfo(brand);
  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brandInfo.brandName,
    logo: brandInfo.logo,
    url: `${baseUrl}/brand/${brand}`,
    description: brandInfo.description.join(" "),
  };

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Prodotti del brand ${brandInfo.brandName}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.imgSrc,
        brand: p.brand,
        description: p.description,
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: p.price,
          url: `${baseUrl}/catalogo/${p.category}/${p.brand}/${p.id}`,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
  return (
    <>
      <Breadcrumbs />
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{brandInfo.brandName}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <Image
              src={brandInfo.logo}
              width={492}
              height={270}
              alt={brandInfo.brandName + "- Logo"}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {brandInfo.description.map((desc, index) => (
                <li key={index}>
                  <p className="text_R"> {desc}</p>
                </li>
              ))}
              <LinkYellow
                title="Mostra tutto"
                href={`/catalogo?brand=${brandInfo.brandName}`}
                className="mr-auto flex"
              />
            </ul>
          </div>
        </div>
      </section>
      <ProductRowListSection
        productsList={products}
        title="I best seller del marchio"
        idSection="brand_best_sellers"
        isBottomLink={true}
      />
      <Script
        id="brand-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <Script
        id="brand-products-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
    </>
  );
}
