"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper";

import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "./carousel.css";
import { Autoplay, Pagination } from "swiper/modules";
import { ButtonArrow } from "@/components/ButtonArrows";
import LinkYellow from "@/components/YellowLink";
const slides = ["/slider/slide1.webp", "/slider/slide2.webp", "/slider/slide3.webp"];

export default function Carousel() {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);

  const onAutoplayTimeLeft = (_: SwiperCore, __: number, progress: number) => {
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
        modules={[Autoplay, Pagination]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
        className="hero_swiper"
      >
        {slides.map((src, i) => (
          <SwiperSlide key={i} className="relative">
            <div className="title_home_carousel w-dvw px-4 md:pl-10">
              <h1 className="H1 mb-6">
                Proteggi ciò che ami <br /> con i nostri sistemi <br /> di videosorveglianza.
              </h1>
              <LinkYellow href="/catalogo" title="Vai allo shop" />
            </div>
            <Image
              src={src}
              width={1440}
              height={677}
              alt={`slide-${i + 1}`}
              priority={i === 0}
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

          <div className="hidden items-center justify-between xl:flex">
            <ButtonArrow direction="left" onClick={() => swiperInstance?.slidePrev()} />
            <ButtonArrow direction="right" onClick={() => swiperInstance?.slideNext()} />
          </div>
        </div>
      </Swiper>
    </div>
  );
}
