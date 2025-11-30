import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import Image from "next/image";
import LinkYellow from "@/components/YellowLink";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { BrandTypes } from "@/types/brands.types";
import { getBrandBySlug } from "@/app/actions/brands/brand-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BrandPage({ brand_slug }: { brand_slug: BrandTypes["brand_slug"] }) {
  console.log({ brand_slug });

  const products = await getAllProducts({ brand_slug });
  const { success, data } = await getBrandBySlug(brand_slug);
  if (!success || !data) {
    notFound();
  }
  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: data.name,
    logo: data.image,
    url: `${baseUrl}/brand/${brand_slug}`,
    description: data.description,
  };

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Prodotti del brand ${data.name}`,
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
      <nav className="py-3 text-sm text-text-grey">
        <ul className="text_R container flex flex-wrap gap-1 capitalize">
          <li>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
          </li>
          <li>
            /<span className="text-white"> {data.name}</span>
          </li>
        </ul>
      </nav>
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{data.name}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <Image
              src={data.image}
              width={492}
              height={270}
              alt={data.name + "- Logo"}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {data.description.split("|").map((desc, index) => (
                <li key={index}>
                  <p className="text_R"> {desc}</p>
                </li>
              ))}
              <LinkYellow
                title="Mostra tutto"
                href={`/catalogo?brand=${data.brand_slug}`}
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
