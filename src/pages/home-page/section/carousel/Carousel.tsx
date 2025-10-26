"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "./carousel.css";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { ButtonArrowLeft, ButtonArrowRight } from "@/components/ButtonArrows";

export default function Carousel() {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  const onAutoplayTimeLeft = (_: any, __: number, progress: number) => {
    if (!progressCircle.current) return;
    progressCircle.current.style.setProperty("--progress", (1 - progress).toString());
  };

  return (
    <div className="relative">
      <Swiper
        spaceBetween={30}
        centeredSlides
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop
        effect="fade"
        modules={[Autoplay, Pagination, EffectFade]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        onSwiper={(swiper) => setSwiperInstance(swiper)} // ✅ зберігаємо інстанс
        className="hero_swiper"
      >
        {Array(3)
          .fill("/Slide1.jpg")
          .map((src, i) => (
            <SwiperSlide key={i}>
              <Image src={src} width={1440} height={677} alt={`slide-${i + 1}`} />
            </SwiperSlide>
          ))}

        <div className="autoplay-progress" slot="container-end">
          <div className="circle_wrapper relative grid h-12 w-12 place-items-center">
            <svg viewBox="0 0 48 48" ref={progressCircle} className="anim_circle">
              <circle cx="24" cy="24" r="8"></circle>
            </svg>
            <svg viewBox="0 0 48 48" className="static_circle">
              <circle cx="24" cy="24" r="8"></circle>
            </svg>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          </div>

          <div className="flex items-center justify-between">
            <ButtonArrowLeft onClick={() => swiperInstance?.slidePrev()} />
            <ButtonArrowRight onClick={() => swiperInstance?.slideNext()} />
          </div>
        </div>
      </Swiper>

      {/* 🔸 Кастомні кнопки */}
    </div>
  );
}
