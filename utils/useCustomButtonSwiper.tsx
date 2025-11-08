"use client";
import { useEffect, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
type SwiperHostElement = HTMLElement & { swiper: SwiperInstance };
export function useCustomButtonSwiper(id: string) {
  const swiper = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const getSwiper = document.getElementById(id) as SwiperHostElement;
    if (getSwiper?.swiper) {
      swiper.current = getSwiper.swiper;
    }
  }, [id]);
  const handlePrev = () => {
    if (swiper.current) {
      swiper.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiper.current) {
      swiper.current.slideNext();
    }
  };

  return { swiper, handlePrev, handleNext };
}
