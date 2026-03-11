"use client";

import { useEffect, useRef, useState } from "react";
import type { BundleMetaDocument, BundleMetaReview } from "@/db/schemas/bundle-meta.schema";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { twMerge } from "tailwind-merge";
import type { IncludedBundleProduct } from "./bundle-page.types";
import BundleTabComponents from "./BundleTabComponents";
import BundleTabDocuments from "./BundleTabDocuments";
import BundleTabReviews from "./BundleTabReviews";
import "swiper/css";

const BUNDLE_TABS = [
  { title: "Componenti", key: "componenti" },
  { title: "Documenti", key: "documenti" },
  { title: "Valutazione", key: "valutazione" },
] as const;

type BundleTabKey = (typeof BUNDLE_TABS)[number]["key"];

const calcCurrentIndex = (tab: BundleTabKey) => BUNDLE_TABS.findIndex((item) => item.key === tab);

export default function BundleDetailsTabsSection({
  includedProducts,
  bundleId,
  bundleName,
  bundleRating,
  documents,
  reviews,
}: {
  includedProducts: IncludedBundleProduct[];
  bundleId: string;
  bundleName: string;
  bundleRating?: string | null;
  documents: BundleMetaDocument[];
  reviews: BundleMetaReview[];
}) {
  const [currentTab, setCurrentTab] = useState<BundleTabKey>("componenti");

  const swiperRef = useRef<SwiperType | null>(null);
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeIndex = calcCurrentIndex(currentTab);

  const handleComponentsContentResize = () => {
    const slider = swiperRef.current;
    if (!slider) return;

    requestAnimationFrame(() => {
      slider.updateAutoHeight(250);
      slider.update();
    });
  };

  useEffect(() => {
    const slider = swiperRef.current;
    if (!slider) return;

    if (slider.activeIndex !== activeIndex) {
      slider.slideTo(activeIndex, 350);
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
        <nav className="flex gap-5 overflow-x-auto scroll-smooth border-b-2 border-stroke-grey">
          {BUNDLE_TABS.map((tab) => (
            <button
              ref={(el) => {
                tabBtnRefs.current[tab.key] = el;
              }}
              type="button"
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={twMerge(
                "H5 shrink-0 border-b-2 border-transparent px-0.5 py-2 text-white md:px-2.5 md:py-4",
                tab.key === currentTab && "text-primary border-yellow-500 text-yellow-500",
              )}
            >
              {tab.title}
            </button>
          ))}
        </nav>

        <div className="mt-3 overflow-x-hidden md:mt-6">
          <Swiper
            onSwiper={(slider) => (swiperRef.current = slider)}
            slidesPerView={1}
            speed={400}
            allowTouchMove
            autoHeight={true}
            noSwiping={true}
            noSwipingClass="swiper-stop"
            onSlideChange={(slider) => {
              const next = BUNDLE_TABS[slider.activeIndex]?.key;
              if (next && next !== currentTab) {
                setCurrentTab(next);
              }
            }}
          >
            <SwiperSlide>
              <BundleTabComponents
                includedProducts={includedProducts}
                className="w-full"
                onContentResize={handleComponentsContentResize}
              />
            </SwiperSlide>
            <SwiperSlide>
              <BundleTabDocuments className="w-full" documents={documents} />
            </SwiperSlide>
            <SwiperSlide>
              <BundleTabReviews
                className="w-full"
                bundleId={bundleId}
                bundleName={bundleName}
                bundleRating={bundleRating}
                reviews={reviews}
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
}
