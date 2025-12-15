"use client";

import Image from "next/image";
import { SwiperSlide, Swiper } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import HeaderProductCard from "@/components/HeaderProductCard";
import PricesBox from "@/components/PricesBox";
import { twMerge } from "tailwind-merge";
import { SlideNextButton, SlidePrevButton } from "@/components/SwiperButtonsReacr";
import { ProductType } from "@/db/schemas/product.schema";
import { useEffect, useState } from "react";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getBrandBySlug } from "@/app/actions/brands/brand-actions";

export const DialogProductCard = ({
  inStock,
  oldPrice,
  price,
  brand_slug,
  place,
  nameFull,
  category_slug,
  id,
  parent_product_id,
  imgSrc,
}: Pick<
  ProductType,
  | "inStock"
  | "oldPrice"
  | "price"
  | "nameFull"
  | "category_slug"
  | "brand_slug"
  | "id"
  | "parent_product_id"
  | "imgSrc"
> & {
  place?: "dialog-cart-product-card" | "product-page";
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [brandLogo, setBrandLogo] = useState<string>("/logo.png");
  useEffect(() => {
    const fetchImages = async () => {
      const idToFetchFoto = parent_product_id ? parent_product_id : id;
      try {
        const resp = await getFotoFromGallery({ parent_product_id: idToFetchFoto });
        if (resp.data && resp.data.images.length > 0) {
          setImages([...resp.data.images, imgSrc]);
        } else {
          setImages([imgSrc]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchImages();
  }, [id, parent_product_id, imgSrc]);

  useEffect(() => {
    const fetchLogoBrand = async () => {
      try {
        const resp = await getBrandBySlug(brand_slug);
        if (resp.success && resp.data) {
          setBrandLogo(resp.data?.image);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogoBrand();
  }, [brand_slug]);
  return (
    <div
      className={twMerge(
        "card_gradient top-0 mx-auto max-h-[590px] min-h-fit w-full max-w-[446px] rounded-sm xl:sticky",
        place === "product-page" && "grid grid-flow-col grid-rows-3",
        place === "dialog-cart-product-card" && "",
      )}
    >
      {place === "product-page" && (
        <ul className="hidden w-fit flex-col gap-3.5 bg-background md:flex">
          {images.map((image) => (
            <li key={image} className="w-fit">
              <Image
                src={image}
                width={96}
                height={96}
                alt={image}
                className="mx-auto aspect-auto h-24 object-contain object-center"
              />
            </li>
          ))}
        </ul>
      )}
      <HeaderProductCard
        id={id}
        inStock={inStock}
        oldPrice={oldPrice}
        className="static pr-0 pl-4 md:pr-2 md:pl-5 lg:pr-0 xl:pr-0"
      />
      <Swiper
        loop={true}
        slidesPerView={1}
        spaceBetween={0}
        modules={[Pagination, Navigation]}
        {...(place === "dialog-cart-product-card" ? { pagination: { clickable: true } } : {})}
        className="relative pb-5"
      >
        {images?.map((image) => (
          <SwiperSlide key={image} className="pb-5">
            <Image
              src={image}
              width={428}
              height={322}
              alt="Pulsante aggiungi"
              className="mx-auto aspect-auto h-[322px] object-contain object-center"
            />
          </SwiperSlide>
        ))}
        {images.length > 1 && (
          <div className={twMerge(place === "dialog-cart-product-card" && "hidden xl:block")}>
            <SlideNextButton />
          </div>
        )}
        {images.length > 1 && (
          <div className={twMerge(place === "dialog-cart-product-card" && "hidden xl:block")}>
            <SlidePrevButton />
          </div>
        )}
      </Swiper>
      {place === "dialog-cart-product-card" && (
        <PricesBox oldPrice={oldPrice} place="dialog-cart-product-card" price={price} />
      )}
      <div
        className={twMerge(
          "mt-5 flex flex-col gap-1 px-3 pb-3 xl:gap-2",

          place === "product-page" && "bg-background pt-5",
        )}
      >
        <Image
          src={brandLogo}
          width={428}
          height={24}
          placeholder="empty"
          alt="Product Image"
          className="mx-auto h-6 object-contain object-center"
        />
        {place === "product-page" && (
          <span className="helper_text text-center text-text-grey capitalize">{category_slug}</span>
        )}
        <h2 className="H4 line-clamp-3 text-center text-white">{nameFull}</h2>
      </div>
    </div>
  );
};
