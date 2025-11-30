"use client";

import { Suspense, useRef } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper";

import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import "./carousel.css";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ButtonArrow } from "@/components/ButtonArrows";
import LinkYellow from "@/components/YellowLink";
import { slidesBanners } from "@/types/main-page-hero-banners.data";

export default function Carousel() {
  const progressCircle = useRef<SVGSVGElement | null>(null);

  const onAutoplayTimeLeft = (_: SwiperCore, __: number, progress: number) => {
    if (!progressCircle.current) return;
    progressCircle.current.style.setProperty("--progress", (1 - progress).toString());
  };

  return (
    <div className="relative">
      <Suspense>
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          effect={"fade"}
          loop={true}
          modules={[Autoplay, Pagination, EffectFade]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          className="hero_swiper"
        >
          {slidesBanners.map((baner, i) => (
            <SwiperSlide key={i} className="relative">
              <div className="title_home_carousel px-4 md:max-w-[60%] md:pl-10">
                <h2 className="H1 mb-6 text-pretty text-white">{baner.title}</h2>
                <LinkYellow href="/catalogo" title="Vai allo shop" />
              </div>
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/50"></div>
              <Image
                src={baner.src}
                width={1440}
                height={677}
                alt={baner.title}
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "auto"}
                loading={i === 0 ? "eager" : "lazy"}
                className="mx-auto h-[677px] object-cover object-center"
              />
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

            <SlideButtons />
          </div>
        </Swiper>
      </Suspense>
    </div>
  );
}

const SlideButtons = () => {
  const swiper = useSwiper();
  return (
    <div className="hidden items-center justify-between xl:flex">
      <ButtonArrow direction="left" onClick={() => swiper.slidePrev()} />
      <ButtonArrow direction="right" onClick={() => swiper.slideNext()} />
    </div>
  );
};
