"use client";

import CardProduct from "@/components/ProductCard/CardProduct";
import { useState } from "react";
import { Product } from "@/types/product.types";
import { SwiperSlide, Swiper } from "swiper/react";
import { getTopProducts } from "./action";

import "./styles.css";
import "swiper/css";

export default function ProductsList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const loadMoreProducts = async () => {
    const newProducts = await getTopProducts(page + 1);
    setProducts((prev) => [...prev, ...newProducts]);
    setPage((prev) => prev + 1);
  };
  return (
    <Swiper
      slidesPerView={"auto"}
      onReachEnd={() => {
        loadMoreProducts();
      }}
      spaceBetween={20}
      className="top_products_list top_products_swiper"
    >
      {products.map((product, index) => (
        <SwiperSlide id="top-products-item" className="" key={index}>
          <CardProduct {...product} className="" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
