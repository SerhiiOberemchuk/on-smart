"use client";

import { Product } from "@/types/product.types";

const TABS = ["Descrizione", "Specifiche", "Documenti", "Valutazione"] as const;

type TabType = (typeof TABS)[number];

export default function ProductCharacteristicsSection({ product }: { product: Product }) {
  //   console.log(product);

  return (
    <section className="pt-3 pb-6 xl:pb-3">
      <div className="container">
        <nav className="flex gap-5 border-b-2 border-stroke-grey">
          {TABS.map((section) => (
            <button
              draggable={true}
              onDrag={(e) => console.log(e)}
              type="button"
              key={section}
              className="H5 px-0.5 py-2 text-white md:px-2.5 md:py-4"
            >
              {section}
            </button>
          ))}
        </nav>
        Add to Basket
      </div>
    </section>
  );
}
