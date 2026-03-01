"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Swiper as SwiperTypes } from "swiper/types";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./product-page.css";
import { Autoplay, FreeMode, Thumbs } from "swiper/modules";

import HeaderProductCard from "@/components/HeaderProductCard";
import { SlideNextButton, SlidePrevButton } from "@/components/SwiperButtonsReacr";
import { ProductType } from "@/db/schemas/product.schema";

export default function ProductSlider({
  product,
  images,
  brandLogo,
  brandName,
}: {
  product: ProductType;
  images: string[];
  brandLogo: string;
  brandName: string;
}) {
  const { id, inStock, oldPrice, brand_slug, nameFull } = product;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperTypes | null>(null);
  const brandLabel = useMemo(() => brand_slug.replace(/[-_]+/g, " ").trim(), [brand_slug]);
  const displayBrandName = brandName || brandLabel;
  const sliderImageAlt = `${nameFull} - ${displayBrandName}`;
  const sliderImages = images.length > 0 ? images : [product.imgSrc || "/logo.svg"];

  return (
    <div className="flex w-full max-w-[670px] justify-around gap-6 rounded-sm bg-background p-3 xl:flex-1 xl:justify-between">
      <Swiper
        direction={"vertical"}
        onSwiper={setThumbsSwiper}
        spaceBetween={0}
        slidesPerView={7}
        watchSlidesProgress={true}
        modules={[Thumbs]}
        className="product_vertical_slider hidden w-24 md:block"
      >
        {sliderImages.map((image, index) => (
          <SwiperSlide key={index} className="card_gradient rounded-sm">
            <Image
              src={image}
              alt={`${sliderImageAlt} (${index + 1})`}
              width={96}
              height={96}
              className="mx-auto aspect-square w-24 rounded-sm object-contain object-center px-1"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="max-w-full">
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
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            thumbs={{
              swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[Thumbs, Autoplay, FreeMode]}
            className="relative ml-5 max-w-[532px]"
          >
            {sliderImages.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt={`${sliderImageAlt} (${index + 1})`}
                  width={532}
                  height={532}
                  className="mx-auto aspect-square rounded-sm object-contain object-center px-1"
                />
              </SwiperSlide>
            ))}
            <SlideNextButton />
            <SlidePrevButton />
          </Swiper>
        </div>
        <Image
          src={brandLogo || "/logo.png"}
          alt={`${displayBrandName} logo`}
          width={428}
          height={24}
          placeholder="empty"
          className="mx-auto mt-5 h-6 object-contain object-center"
        />
        <h2 className="helper_text mt-2 text-center text-text-grey capitalize">{displayBrandName}</h2>
        <p className="H4 mt-2 text-center text-white">{nameFull}</p>
      </div>
    </div>
  );
}
