"use client";

import { useSwiper } from "swiper/react";
import { ButtonArrow } from "./ButtonArrows";

export function SlidePrevButton() {
  const swiper = useSwiper();

  return (
    <ButtonArrow
      direction="left"
      onClick={() => swiper.slidePrev()}
      className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
    />
  );
}
export function SlideNextButton() {
  const swiper = useSwiper();
  return (
    <ButtonArrow
      direction="right"
      onClick={() => swiper.slideNext()}
      className="absolute top-1/2 right-0 z-50 -translate-y-1/2"
    />
  );
}
