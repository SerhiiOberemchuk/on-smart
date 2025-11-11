"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
// import "swiper/css/free-mode";
// import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./product-page.css";
import { Thumbs } from "swiper/modules";
import { useState } from "react";
import { Product } from "@/types/product.types";
import Image from "next/image";
import { SlideNextButton, SlidePrevButton } from "../SwiperButtonsReacr";
import HeaderProductCard from "../HeaderProductCard";
import { Swiper as SwiperTypes } from "swiper/types";

export default function ProductSlider({ product }: { product: Product }) {
  const { id, inStock, oldPrice, images, logo, category, name } = product;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperTypes | null>(null);
  return (
    <div className="flex w-full justify-around gap-6 rounded-sm bg-background p-3 xl:flex-1 xl:justify-between">
      <Swiper
        direction={"vertical"}
        onSwiper={setThumbsSwiper}
        // loop={true}
        spaceBetween={0}
        slidesPerView={7}
        // freeMode={true}
        watchSlidesProgress={true}
        modules={[Thumbs]}
        className="product_vertical_slider hidden w-24 md:block"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="card_gradient rounded-sm">
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              width={96}
              height={96}
              className="mx-auto aspect-square w-24 rounded-sm object-contain object-center px-1"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div>
        <div className="card_gradient relative rounded-sm">
          <HeaderProductCard
            id={id}
            inStock={inStock}
            oldPrice={oldPrice}
            className="absolute top-0 left-0 pr-0 pl-4 md:pr-2 md:pl-5 lg:pr-0 xl:pr-0"
          />
          <Swiper
            loop={true}
            spaceBetween={0}
            slidesPerView={1}
            // navigation={true}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Thumbs]}
            className="relative ml-5 w-[226px] mob:w-[326px] sm:w-[530px]"
          >
            {product.images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={532}
                  height={532}
                  className="mx-auto aspect-square object-contain object-center px-1 xs:w-[530px]"
                />
              </SwiperSlide>
            ))}
            <SlideNextButton />
            <SlidePrevButton />
          </Swiper>
        </div>
        <Image
          src={logo}
          alt="Product logo"
          width={428}
          height={24}
          placeholder="empty"
          className="mx-auto mt-5 h-6 object-contain object-center"
        />
        <h2 className="helper_text mt-2 text-center text-text-grey capitalize">{category}</h2>
        <p className="H4 mt-2 text-center text-white">{name}</p>
      </div>
    </div>
  );
}
