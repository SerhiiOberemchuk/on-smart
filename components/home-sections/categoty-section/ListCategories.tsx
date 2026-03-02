import Script from "next/script";
import Image from "next/image";
import Link from "next/link";

import { GetAllCategoriesResponse } from "@/app/actions/category/category-actions";
import { baseUrl } from "@/types/baseUrl";

import styles from "./category.module.css";

function toAbsoluteImageUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${baseUrl}${src}`;
}

export default async function ListCategories({
  categories,
}: {
  categories: GetAllCategoriesResponse;
}) {
  const { data, success } = await categories;

  if (!data || data.length === 0 || !success) {
    return <p className="py-10 text-center text-gray-400">Nessuna categoria disponibile.</p>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: `${baseUrl}/#category-section`,
    name: "Categorie di prodotto OnSmart",
    description:
      "Esplora le categorie di prodotti OnSmart: sistemi di videosorveglianza, sensori, sirene e dispositivi smart per la sicurezza della casa.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: data.length,
    itemListElement: data.map((category, index) => {
      const categoryUrl = `${baseUrl}/categoria/${encodeURIComponent(category.category_slug)}`;
      const imageUrl = toAbsoluteImageUrl(category.image);

      return {
        "@type": "ListItem",
        position: index + 1,
        url: categoryUrl,
        item: {
          "@type": "CollectionPage",
          name: category.name,
          url: categoryUrl,
          image: imageUrl,
          description: category.description || category.title_full || undefined,
        },
      };
    }),
  };

  return (
    <>
      <ul className={styles.list}>
        {data.map(({ id, name, image, category_slug }) => (
          <li
            key={id}
            className="relative overflow-hidden rounded-sm transition-transform duration-300 hover:scale-105"
          >
            <Link
              href={`/categoria/${encodeURIComponent(category_slug)}`}
              title={name}
              aria-label={`Apri la categoria ${name}`}
            >
              <Image
                src={image}
                className="mx-auto rounded-sm opacity-50"
                width={355}
                height={355}
                sizes="(min-width: 1280px) 320px, (min-width: 800px) 200px, 45vw"
                alt={`Categoria: ${name}`}
              />
            </Link>
            <h3 className="H3 pointer-events-none absolute bottom-[8%] left-0 w-full px-2 text-center text-wrap">
              {name}
            </h3>
          </li>
        ))}
      </ul>
      <Script
        id="category-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
