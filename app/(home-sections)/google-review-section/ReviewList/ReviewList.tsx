"use client";

import { SwiperSlide, Swiper } from "swiper/react";
import iconQuote from "@/assets/icons/symbol-“.svg";

import { GoogleReview } from "@/types/google-reviews.types";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";
import { Tooltip } from "react-tooltip";
import { formatDate } from "@/utils/formatter-data";
import { Pagination } from "swiper/modules";
import StarsRating from "@/components/StarsRating";

export default function ReviewList({ reviews }: { reviews: GoogleReview[] }) {
  return (
    <Swiper
      id="review_list_slider"
      slidesPerView={"auto"}
      spaceBetween={20}
      modules={[Pagination]}
      pagination={{ clickable: true }}
      className="review_list"
    >
      {reviews.map((item, index) => (
        <SwiperSlide id="review-item" className="" key={index}>
          <article className="flex w-[326px] flex-col justify-between gap-3 rounded-sm border border-stroke-grey bg-background px-3 py-6">
            <header className="flex items-start justify-between">
              <Image src={iconQuote} alt="Quote Icon" width={26} height={23} aria-hidden />

              <div className="flex flex-col">
                <p className="helper_text text-text-grey">{formatDate(item.date)}</p>
                <StarsRating rating={item.rating} />
              </div>
            </header>
            <div className="flex flex-col gap-2">
              <p
                className="input_R_18 line-clamp-3"
                data-tooltip-id="review-tooltip-text"
                data-tooltip-content={item.reviewText}
              >
                {item.reviewText}
              </p>
              <Tooltip
                id="review-tooltip-text"
                place="left"
                style={{ zIndex: 1000, maxWidth: 500 }}
              />

              <h3 className="input_R_18 ml-auto">{item.clientName}</h3>
            </div>
          </article>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
