"use client";

import { SwiperSlide, Swiper } from "swiper/react";
import iconQuote from "@/assets/icons/symbol-“.svg";

import { GoogleReview } from "@/types/google-reviews.types";
import Image from "next/image";
import starempty from "@/assets/icons/star-empty.svg";
import starfull from "@/assets/icons/star-full.svg";
import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";
import { Tooltip } from "react-tooltip";
import { formatDate } from "@/utils/formatter-data";
import { Pagination } from "swiper/modules";

export default function ReviewList({ reviews }: { reviews: GoogleReview[] }) {
  return (
    <Swiper
      slidesPerView={"auto"}
      spaceBetween={20}
      modules={[Pagination]}
      pagination={{ clickable: true }}
      className="review_list review_swiper"
    >
      {reviews.map((item, index) => (
        <SwiperSlide id="review-item" className="" key={index}>
          <article className="flex w-[326px] flex-col justify-between gap-3 rounded-sm border border-stroke-grey bg-background px-3 py-6">
            <header className="flex items-start justify-between">
              <Image src={iconQuote} alt="Quote Icon" width={26} height={23} aria-hidden />

              <div className="flex flex-col">
                <p className="helper_text text-text-grey">{formatDate(item.date)}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Image
                      key={i}
                      src={item.rating >= i + 1 ? starfull : starempty}
                      alt={`star${item.rating > i ? "full" : "empty"}`}
                      width={16}
                      height={16}
                      aria-hidden
                    />
                  ))}
                </div>
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
