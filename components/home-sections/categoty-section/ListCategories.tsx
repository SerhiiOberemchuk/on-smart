"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./category.module.css";
import { use, useEffect, useState } from "react";
import { CategoryTypes } from "@/types/category.types";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";

export default function ListCategories() {
  //     {
  //   categories,
  // }: {
  //   categories: Promise<{ success: boolean; data: CategoryTypes[] }>;
  // }
  //   const { data } = use(categories);
  const [data, setData] = useState<CategoryTypes[]>([]);
  useEffect(() => {
    console.log("start fetch category");
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
        console.log(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
        image: cat.image,
        url: `${baseUrl}/categoria/${cat.category_slug}`,
      },
    })),
  };
  return (
    <>
      <ul className={styles.list}>
        {data.map(({ id, name, image, category_slug }) => (
          <li
            key={id}
            className="relative rounded-sm transition-transform duration-300 hover:scale-105"
          >
            <Link href={"/categoria/" + category_slug} title={name}>
              <Image
                src={image}
                className="mx-auto rounded-sm opacity-50"
                width={355}
                height={355}
                alt={`Categoria: ${name}`}
              />
            </Link>
            <h3 className="H3 pointer-events-none absolute bottom-[8%] left-0 w-full px-2 text-center text-wrap">
              {name}
            </h3>
          </li>
        ))}
      </ul>{" "}
      <Script
        id="category-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
