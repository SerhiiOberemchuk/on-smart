import LinkYellow from "@/components/YellowLink";
import { getCategories } from "./action";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";

export default async function CategorySection() {
  const categories = await getCategories();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categorie di prodotti",
    description:
      "Esplora le categorie di prodotti OnSmart: sistemi di videosorveglianza, sensori, sirene e dispositivi smart per la sicurezza della casa.",
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.categoryName,
      image: cat.imageUrl.startsWith("http") ? cat.imageUrl : `${baseUrl}${cat.imageUrl}`,
      url: `${baseUrl}/catalogo?category=${encodeURIComponent(cat.categoryType)}`,
    })),
  };
  return (
    <section id="category-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">Esplora per Categoria</h2>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
      </header>
      <div className="container">
        <ul className={styles.list}>
          {categories.map(({ id, categoryName, imageUrl, categoryType }) => (
            <li key={id} className="rounded-sm transition-transform duration-300 hover:scale-105">
              <Link
                className="relative"
                href={`/catalogo?category=${categoryType}`}
                title={categoryName}
              >
                <Image
                  src={imageUrl}
                  className="mx-auto aspect-square rounded-sm object-contain object-center opacity-50"
                  width={355}
                  height={355}
                  alt={categoryName}
                />
                <h2 className="H3 absolute bottom-[8%] left-0 w-full text-center text-wrap">
                  {categoryName}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <LinkYellow href="/catalogo" className="mx-auto flex md:hidden" title="Tutti i prodotti" />
      <Script
        id="category-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
