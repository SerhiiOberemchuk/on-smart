"use client";

import {
  DEFAULT_TAB_CHARACTERISTICS,
  TABS_CHARACTERISTICS,
  TabTypeCaracteristics,
} from "@/types/product-cararteristics.types";
import { Product, Product_Details } from "@/types/product.types";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import Descrizione from "./components-characteristic/Descrizione";
import Specifiche from "./components-characteristic/Specifiche";
import Documenti from "./components-characteristic/Documenti";
import Valutazione from "./components-characteristic/Valutazione";

const calcCurrentIndex = (prevTab: TabTypeCaracteristics) =>
  TABS_CHARACTERISTICS.findIndex((tab) => tab.searchParam === prevTab);

export default function ProductCharacteristicsSection({
  productDetail,
  product,
}: {
  productDetail: Product_Details;
  product: Product;
}) {
  const {
    characteristics_descrizione,
    characteristics_specifiche,
    characteristics_documenti,
    characteristics_valutazione,
  } = productDetail;
  const swipeWrapperRef = useRef<HTMLDivElement | null>(null);
  const [currentTab, setCurrentTab] = useState<TabTypeCaracteristics>(DEFAULT_TAB_CHARACTERISTICS);

  useEffect(() => {
    let hammer: HammerManager | null = null;
    import("hammerjs").then((Hammer) => {
      const shouldIgnore = (ev: HammerInput) => {
        return (ev.target as HTMLElement)?.closest(".swiper-stop");
      };
      if (!swipeWrapperRef.current) return;
      hammer = new Hammer.default(swipeWrapperRef.current);

      hammer.on("swipeleft", (ev) => {
        if (shouldIgnore(ev)) return;
        setCurrentTab((prev) => {
          if (calcCurrentIndex(prev) >= TABS_CHARACTERISTICS.length - 1) return prev;
          return TABS_CHARACTERISTICS[calcCurrentIndex(prev) + 1].searchParam;
        });
      });

      hammer.on("swiperight", (ev) => {
        if (shouldIgnore(ev)) return;
        setCurrentTab((prev) => {
          if (calcCurrentIndex(prev) <= 0) return prev;
          return TABS_CHARACTERISTICS[calcCurrentIndex(prev) - 1].searchParam;
        });
      });
    });
    return () => {
      if (hammer) {
        hammer.destroy();
      }
    };
  }, [swipeWrapperRef]);

  return (
    <section className="pt-3 pb-6 xl:pb-3">
      <div className="container">
        <nav className="flex gap-5 overflow-x-auto border-b-2 border-stroke-grey">
          {TABS_CHARACTERISTICS.map((section) => (
            <button
              type="button"
              key={section.searchParam}
              onClick={() => setCurrentTab(section.searchParam)}
              className={twMerge(
                "H5 border-b-2 border-transparent px-0.5 py-2 text-white md:px-2.5 md:py-4",
                section.searchParam === currentTab &&
                  "text-primary border-yellow-500 text-yellow-500",
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
        <div className="mt-3 overflow-x-hidden md:mt-6">
          <div
            ref={swipeWrapperRef}
            className={twMerge("flex transition-transform duration-400")}
            style={{
              width: `${TABS_CHARACTERISTICS.length * 100}%`,
              transform: `translateX(-${TABS_CHARACTERISTICS.findIndex((tab) => tab.searchParam === currentTab) * 25}%)`,
            }}
          >
            <Descrizione data={characteristics_descrizione} className={"flex-1 shrink-0"} />
            <Specifiche data={characteristics_specifiche} className={"flex-1 shrink-0"} />
            <Documenti data={characteristics_documenti} className={"flex-1 shrink-0"} />
            <Valutazione
              data={characteristics_valutazione}
              product={product}
              className={"flex-1 shrink-0"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
