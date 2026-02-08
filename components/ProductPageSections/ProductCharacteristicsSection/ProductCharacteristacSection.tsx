"use client";

import {
  DEFAULT_TAB_CHARACTERISTICS,
  TABS_CHARACTERISTICS,
  TabTypeCaracteristics,
} from "@/types/product-cararteristics.types";
import { Product_Details } from "@/types/product.types";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import Descrizione from "./components-characteristic/Descrizione";
import Specifiche from "./components-characteristic/Specifiche";
import Documenti from "./components-characteristic/Documenti";
import Valutazione from "./components-characteristic/Valutazione";
import { ProductType } from "@/db/schemas/product.schema";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

const calcCurrentIndex = (tab: TabTypeCaracteristics) =>
  TABS_CHARACTERISTICS.findIndex((t) => t.searchParam === tab);

export default function ProductCharacteristicsSection({
  productDetail,
  product,
}: {
  productDetail: Product_Details;
  product: ProductType;
}) {
  const {
    characteristics_descrizione,
    characteristics_specifiche,
    characteristics_documenti,
    characteristics_valutazione,
  } = productDetail;

  const [currentTab, setCurrentTab] = useState<TabTypeCaracteristics>(DEFAULT_TAB_CHARACTERISTICS);

  const swiperRef = useRef<SwiperType | null>(null);
  const tabsNavRef = useRef<HTMLDivElement | null>(null);
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeIndex = calcCurrentIndex(currentTab);

  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;

    if (s.activeIndex !== activeIndex) {
      s.slideTo(activeIndex, 350);
    }
  }, [activeIndex]);
  useEffect(() => {
    const btn = tabBtnRefs.current[currentTab];
    if (!btn) return;

    btn.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentTab]);

  return (
    <section className="pt-3 pb-6 xl:pb-3">
      <div className="container">
        <nav
          ref={tabsNavRef}
          className="flex gap-5 overflow-x-auto scroll-smooth border-b-2 border-stroke-grey"
        >
          {TABS_CHARACTERISTICS.map((section) => (
            <button
              ref={(el) => {
                tabBtnRefs.current[section.searchParam] = el;
              }}
              type="button"
              key={section.searchParam}
              onClick={() => setCurrentTab(section.searchParam)}
              className={twMerge(
                "H5 shrink-0 border-b-2 border-transparent px-0.5 py-2 text-white md:px-2.5 md:py-4",
                section.searchParam === currentTab &&
                  "text-primary border-yellow-500 text-yellow-500",
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="mt-3 overflow-x-hidden md:mt-6">
          <Swiper
            onSwiper={(s) => (swiperRef.current = s)}
            slidesPerView={1}
            speed={400}
            allowTouchMove
            autoHeight={true}
            noSwiping={true}
            noSwipingClass="swiper-stop"
            onSlideChange={(s) => {
              const next = TABS_CHARACTERISTICS[s.activeIndex]?.searchParam;
              if (next && next !== currentTab) setCurrentTab(next);
            }}
          >
            <SwiperSlide>
              <Descrizione data={characteristics_descrizione} className="w-full" />
            </SwiperSlide>

            <SwiperSlide>
              <Specifiche data={characteristics_specifiche} className="w-full" />
            </SwiperSlide>

            <SwiperSlide>
              <Documenti data={characteristics_documenti} className="w-full" />
            </SwiperSlide>

            <SwiperSlide>
              <Valutazione
                data={characteristics_valutazione}
                product={product}
                className="w-full"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
}
