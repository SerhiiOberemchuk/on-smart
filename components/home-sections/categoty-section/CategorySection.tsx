import LinkYellow from "@/components/YellowLink";
import Link from "next/link";
import Image from "next/image";
import styles from "./category.module.css";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { CategoryTypes } from "@/types/category.types";
// import { getAllCategoryProducts } from "@/app/actions/category/category-actions";

export default async function CategorySection() {
  let data: CategoryTypes[] = [];
  let success = false;
  try {
    const dataFetch = await fetch(`${baseUrl}/api/categories`, {
      cache: "force-cache",
      next: { revalidate: 7200, tags: ["all_categories"] },
    });
    const dataJSON: { success: boolean; data: CategoryTypes[]; error: Error } =
      await dataFetch.json();
    success = dataJSON.success;
    data = dataJSON.data;
  } catch (error) {
    console.error(error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categorie di prodotti",
    description:
      "Esplora le categorie di prodotti OnSmart: sistemi di videosorveglianza, sensori, sirene e dispositivi smart per la sicurezza della casa.",
    numberOfItems: data.length,
    itemListElement: data.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: cat.name,
        image: cat.image.startsWith("http") ? cat.image : `${baseUrl}${cat.image}`,
        url: `${baseUrl}/catalogo?category=${encodeURIComponent(cat.category_slug)}`,
      },
    })),
  };
  if (!success) {
    return null;
  }
  return (
    <section id="category-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">Esplora per Categoria</h2>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
        <p className="sr-only">
          Esplora le categorie principali dei nostri prodotti di sicurezza, videosorveglianza e
          smart home.
        </p>
      </header>
      <div className="container">
        <ul className={styles.list}>
          {data.map(({ id, name, image, category_slug }, i) => (
            <li
              key={id}
              className="relative rounded-sm transition-transform duration-300 hover:scale-105"
            >
              <Link
                //  href={`/catalogo?category=${category_slug}`}
                href={"/categoria/" + category_slug}
                title={name}
              >
                <Image
                  src={image}
                  className="mx-auto aspect-square rounded-sm object-contain object-center opacity-50"
                  width={355}
                  height={355}
                  alt={`Categoria: ${name}`}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </Link>
              <h3 className="H3 pointer-events-none absolute bottom-[8%] left-0 w-full px-2 text-center text-wrap">
                {name}
              </h3>
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
