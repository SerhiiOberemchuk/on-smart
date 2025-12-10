"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./product-page.css";
import { Autoplay, Thumbs } from "swiper/modules";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Swiper as SwiperTypes } from "swiper/types";
import HeaderProductCard from "@/components/HeaderProductCard";
import { SlideNextButton, SlidePrevButton } from "@/components/SwiperButtonsReacr";
import { Product } from "@/db/schemas/product";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getBrandBySlug } from "@/app/actions/brands/brand-actions";
import { BrandTypes } from "@/types/brands.types";

export default function ProductSlider({ product }: { product: Product }) {
  const { id, inStock, oldPrice, imgSrc, parent_product_id, brand_slug, nameFull } = product;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperTypes | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [brandInfo, setBrandInfo] = useState<BrandTypes | null>(null);
  useEffect(() => {
    const setClient = () => setIsClient(true);
    setClient();
  }, []);
  useEffect(() => {
    const idOpt = parent_product_id ? parent_product_id : id;
    const fetchImages = async () => {
      try {
        const resp = await getFotoFromGallery({ parent_product_id: idOpt });
        if (resp.data && resp.data?.images.length > 0) {
          setImages([...resp.data.images, imgSrc]);
          return;
        }
        setImages([imgSrc]);
      } catch (error) {
        console.error(error);
        setImages([imgSrc]);
      }
    };
    fetchImages();
  }, [id, parent_product_id, imgSrc]);
  useEffect(() => {
    const fetchLogoBrand = async () => {
      try {
        const resp = await getBrandBySlug(brand_slug);
        if (resp.data) {
          setBrandInfo(resp.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogoBrand();
  }, [brand_slug]);
  if (!isClient) return null;
  return (
    <div className="flex w-full max-w-[670px] justify-around gap-6 rounded-sm bg-background p-3 xl:flex-1 xl:justify-between">
      <Swiper
        direction={"vertical"}
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={0}
        slidesPerView={7}
        freeMode={true}
        watchSlidesProgress={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Thumbs, Autoplay]}
        className="product_vertical_slider pointer-events-none hidden w-24 md:block"
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
      <div className="max-w-full">
        <div className="card_gradient relative rounded-sm">
          <HeaderProductCard
            id={id}
            inStock={inStock}
            oldPrice={oldPrice}
            className="absolute top-0 left-0 pr-0 pl-4 md:pr-2 md:pl-5 lg:pr-0 xl:pr-0"
          />
          {thumbsSwiper && !thumbsSwiper.destroyed && (
            <Swiper
              loop={true}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              thumbs={{ swiper: thumbsSwiper ?? undefined }}
              modules={[Thumbs, Autoplay]}
              className="relative ml-5 max-w-[532px]"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    width={532}
                    height={532}
                    className="mx-auto aspect-square rounded-sm object-contain object-center px-1"
                  />
                </SwiperSlide>
              ))}
              <SlideNextButton />
              <SlidePrevButton />
            </Swiper>
          )}
        </div>
        <Image
          src={brandInfo?.image || "/logo.png"}
          alt="Product logo"
          width={428}
          height={24}
          placeholder="empty"
          className="mx-auto mt-5 h-6 object-contain object-center"
        />
        <h2 className="helper_text mt-2 text-center text-text-grey capitalize">
          {brandInfo?.name}
        </h2>
        <p className="H4 mt-2 text-center text-white">{nameFull}</p>
      </div>
    </div>
  );
}
