import LinkYellow from "@/components/YellowLink";
import Link from "next/link";
import Image from "next/image";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { Suspense } from "react";
import { getAllBrands } from "@/app/actions/brands/brand-actions";

export default async function BrandSection() {
  const brands = await getAllBrands();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "I brand che trattiamo",
    description:
      "Scopri i marchi di prodotti trattati da OnSmart: brand leader nella videosorveglianza e nella sicurezza come Ajax, Uniview, Dahua e molti altri.",
    numberOfItems: brands.data.length,
    itemListElement: brands.data.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Brand",
        name: b.name,
        logo: b.image.startsWith("http") ? b.image : `${baseUrl}${b.image}`,
        image: b.image.startsWith("http") ? b.image : `${baseUrl}${b.image}`,
        url: `${baseUrl}/brand/${encodeURIComponent(b.brand_slug)}`,
      },
    })),
  };
  return (
    <section id="brand-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">I brand che trattiamo</h2>
          <p className="sr-only">
            Scopri i marchi leader nella videosorveglianza e sicurezza trattati da OnSmart: Ajax,
            Dahua, Uniview, Ezviz, Hilook e molti altri.
          </p>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
      </header>
      <div className="container">
        <Suspense>
          <ul className="flex flex-wrap items-center justify-center gap-px py-2 lg:gap-3">
            {brands.data.map(({ id, name, image, brand_slug }) => (
              <li key={id} className="transition-transform duration-300 hover:scale-105">
                <Link className="flex p-5 md:p-7" href={`/brand/${brand_slug}`} title={name}>
                  <Image
                    src={image}
                    className="h-auto w-fit object-contain object-center"
                    alt={`Logo del brand ${name}`}
                    height={32}
                    width={150}
                    loading="lazy"
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
