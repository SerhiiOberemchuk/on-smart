"use client";

import CardProduct from "@/components/ProductCard/CardProduct";
import { Product } from "@/types/product.types";
import { SwiperSlide, Swiper } from "swiper/react";

import "./styles.css";
import "swiper/css";

export default function ProductsList({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Swiper slidesPerView={"auto"} spaceBetween={20} id="top_products_list_slider" className="top_products_list">
      {initialProducts.map((product, index) => (
        <SwiperSlide id="top-products-item" className="" key={index}>
          <CardProduct {...product} className="" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
