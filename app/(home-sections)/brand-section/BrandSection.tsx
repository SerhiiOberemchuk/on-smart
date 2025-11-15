import LinkYellow from "@/components/YellowLink";
import { getBrands } from "./action";
import Link from "next/link";
import Image from "next/image";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { Suspense } from "react";

export default async function BrandSection() {
  const brands = await getBrands();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "I brand che trattiamo",
    description:
      "Scopri i marchi di prodotti trattati da OnSmart: brand leader nella videosorveglianza e nella sicurezza come Ajax, Uniview, Dahua e molti altri.",
    numberOfItems: brands.length,
    itemListElement: brands.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Brand",
        name: b.brandName,
        image: b.imageUrl.startsWith("http") ? b.imageUrl : `${baseUrl}${b.imageUrl}`,
        url: `${baseUrl}/brand/${encodeURIComponent(b.brandType)}`,
      },
    })),
  };
  return (
    <section id="brand-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">I brand che trattiamo</h2>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
      </header>
      <div className="container">
        <Suspense>
          <ul className="flex flex-wrap items-center justify-center gap-px py-2 lg:gap-3">
            {brands.map(({ id, brandName, imageUrl, brandType }) => (
              <li key={id} className="transition-transform duration-300 hover:scale-105">
                <Link className="flex p-5 md:p-7" href={`/brand/${brandType}`} title={brandName}>
                  <Image
                    src={imageUrl}
                    className="h-auto w-fit object-contain object-center"
                    alt={brandName}
                    height={32}
                    width={150}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Suspense>
      </div>
      <LinkYellow href="/catalogo" className="mx-auto flex md:hidden" title="Tutti i prodotti" />

      <Script
        id="brand-section-jsonLd"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
