import { baseUrl } from "@/types/baseUrl";
import { BrandTypes } from "@/types/brands.types";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { use } from "react";

export default function ListBrends({
  props,
}: {
  props: Promise<{
    success: boolean;
    data: BrandTypes[];
  }>;
}) {
  const { data, success } = use(props);
  if (!data || data.length === 0 || !success) {
    return <p className="py-10 text-center text-gray-400">Nessun brand disponibile.</p>;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "I brand che trattiamo",
    description:
      "Scopri i marchi di prodotti trattati da OnSmart: brand leader nella videosorveglianza e nella sicurezza come Ajax, Uniview, Dahua e molti altri.",
    numberOfItems: data.length,
    itemListElement: data.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Brand",
        name: b.name,
        logo: b.image,
        image: b.image,
        url: `${baseUrl}/brand/${b.brand_slug}`,
      },
    })),
  };
  return (
    <>
      <ul className="flex flex-wrap items-center justify-center gap-px py-2 lg:gap-3">
        {data.map(({ id, name, image, brand_slug }) => (
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
      <Script
        id="brand-section-jsonLd"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
