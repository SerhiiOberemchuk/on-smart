import Image from "next/image";
import { SwiperSlide, Swiper, useSwiper } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import HeaderProductCard from "@/components/HeaderProductCard";
import { Product } from "@/types/product.types";
import { ButtonArrow } from "@/components/ButtonArrows";
import PricesBox from "@/components/PricesBox";

export const ProductCardDialog = ({
  images,
  inStock,
  oldPrice,
  price,
  logo,
  name,
}: Pick<Product, "id" | "inStock" | "oldPrice" | "images" | "price" | "logo" | "name">) => {
  return (
    <div className="card_gradient mx-auto max-h-[590px] min-h-fit w-full max-w-[446px]">
      <HeaderProductCard
        id="dd"
        inStock={inStock}
        oldPrice={oldPrice}
        className="static pr-0 pl-4 md:pr-2 md:pl-5 lg:pr-0 xl:pr-0"
      />
      <Swiper
        loop={true}
        slidesPerView={1}
        spaceBetween={0}
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true }}
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
        <SlideNextButton />
        <SlidePrevButton />
      </Swiper>
      <PricesBox oldPrice={oldPrice} place="dialog-cart-product-card" price={price} />
      <div className="mt-5 px-3 pb-3">
        <Image
          src={logo}
          width={428}
          height={24}
          alt="Product Image"
          className="mx-auto aspect-auto h-6 object-contain object-center"
        />
        <h2 className="H4 mt-3 line-clamp-3 text-center text-white">{name}</h2>
      </div>
    </div>
  );
};
function SlidePrevButton() {
  const swiper = useSwiper();

  return (
    <ButtonArrow
      direction="left"
      onClick={() => swiper.slidePrev()}
      className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
    />
  );
}
function SlideNextButton() {
  const swiper = useSwiper();
  return (
    <ButtonArrow
      direction="right"
      onClick={() => swiper.slideNext()}
      className="absolute top-1/2 right-0 z-50 -translate-y-1/2"
    />
  );
}
