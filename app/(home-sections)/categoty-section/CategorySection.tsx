import LinkYellow from "@/components/YellowLink";
import { getCategories } from "./action";
import Link from "next/link";
import Image from "next/image";

export default async function CategorySection() {
  const categories = await getCategories();
  return (
    <section id="category-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">Esplora per Categoria</h2>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
      </header>
      <div className="container">
        <ul className="grid">
          {categories.map(({ id, categoryName, imageUrl, categoryType }) => (
            <li key={id} className="">
              <Link
                className="relative flex aspect-square w-fit justify-center"
                href={`/catalogo/${categoryType}`}
                title={categoryName}
              >
                <Image
                  src={imageUrl}
                  className="opacity-50"
                  width={355}
                  height={355}
                  alt={categoryName}
                />
                <h2 className="H3 absolute bottom-0 left-1/2 -translate-x-1/2 uppercase">
                  {categoryName}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <LinkYellow href="/catalogo" className="mx-auto flex md:hidden" title="Tutti i prodotti" />
    </section>
  );
}
