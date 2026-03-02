import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import { baseUrl } from "@/types/baseUrl";
import { BrandTypes } from "@/types/brands.types";

type BrandListResult = {
  success: boolean;
  data: BrandTypes[];
  error?: unknown;
};

function toAbsoluteImageUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${baseUrl}${src}`;
}

export default async function ListBrends({
  props,
}: {
  props: Promise<BrandListResult>;
}) {
  const { data, success } = await props;

  if (!data || data.length === 0 || !success) {
    return <p className="py-10 text-center text-gray-400">Nessun brand disponibile.</p>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: `${baseUrl}/#brand-section`,
    name: "I brand che trattiamo",
    description:
      "Scopri i marchi di prodotti trattati da OnSmart: brand leader nella videosorveglianza e nella sicurezza come Ajax, Uniview, Dahua e molti altri.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: data.length,
    itemListElement: data.map((brand, index) => {
      const brandUrl = `${baseUrl}/brand/${encodeURIComponent(brand.brand_slug)}`;
      const logoUrl = toAbsoluteImageUrl(brand.image);

      return {
        "@type": "ListItem",
        position: index + 1,
        url: brandUrl,
        item: {
          "@type": "Brand",
          name: brand.name,
          logo: logoUrl,
          image: logoUrl,
          url: brandUrl,
        },
      };
    }),
  };

  return (
    <>
      <ul className="flex flex-wrap items-center justify-center gap-px py-2 lg:gap-3">
        {data.map(({ id, name, image, brand_slug }) => (
          <li key={id} className="transition-transform duration-300 hover:scale-105">
            <Link
              className="flex p-5 md:p-7"
              href={`/brand/${encodeURIComponent(brand_slug)}`}
              title={name}
              aria-label={`Apri il brand ${name}`}
            >
              <Image
                src={image}
                className="h-auto w-fit object-contain object-center"
                alt={`Logo del brand ${name}`}
                height={32}
                width={150}
                loading="lazy"
                sizes="150px"
              />
            </Link>
          </li>
        ))}
      </ul>
      <Script
        id="brand-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
