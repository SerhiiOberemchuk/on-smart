"use client";

import CardProduct from "@/components/ProductCard/CardProduct";
import { SwiperSlide, Swiper } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

import "./styles.css";
import { FreeMode, Navigation } from "swiper/modules";
import { ProductType } from "@/db/schemas/product.schema";

export default function ProductsList({
  initialProducts,
  idSection,
}: {
  initialProducts: ProductType[];
  idSection: string;
}) {
  return (
    <Swiper
      slidesPerView={"auto"}
      spaceBetween={20}
      id="top_products_list_slider"
      freeMode={true}
      modules={[Navigation, FreeMode]}
      navigation={{
        nextEl: `#${idSection}_slider_next`,
        prevEl: `#${idSection}_slider_prev`,
      }}
      className="top_products_list"
    >
      {initialProducts.map((product, index) => (
        <SwiperSlide
          id="top-products-item"
          // className="transition-all duration-300 hover:scale-105"
          key={index}
        >
          <CardProduct {...product} className="" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
