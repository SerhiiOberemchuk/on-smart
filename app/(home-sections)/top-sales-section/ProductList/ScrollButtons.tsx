"use client";

import { ButtonArrow } from "@/components/ButtonArrows";
import { useEffect, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
type SwiperHostElement = HTMLElement & { swiper: SwiperInstance };

export default function ScrollButtons() {
  const sliderRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const getSwiper = document.querySelector(".top_products_swiper") as SwiperHostElement | null;
    if (getSwiper?.swiper) {
      sliderRef.current = getSwiper.swiper;
    }
  }, []);

  return (
    <nav>
      <ButtonArrow direction="left" onClick={() => sliderRef.current?.slidePrev()} />
      <ButtonArrow direction="right" onClick={() => sliderRef.current?.slideNext()} />
    </nav>
  );
}
