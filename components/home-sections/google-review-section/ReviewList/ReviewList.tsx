"use client";

import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import iconQuote from "@/assets/icons/symbol-quote.svg";
import StarsRating from "@/components/StarsRating";
import { GoogleReview } from "@/types/google-reviews.types";
import { formatDate } from "@/utils/formatter-data";

import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";

export default function ReviewList({ reviews }: { reviews: GoogleReview[] }) {
  if (!reviews.length) return null;

  return (
    <Swiper
      id="review_list_slider"
      aria-label="Recensioni Google dei clienti OnSmart"
      slidesPerView={"auto"}
      spaceBetween={20}
      modules={[Pagination, Navigation]}
      pagination={{ clickable: true }}
      navigation={{ nextEl: "#review_list_slider_next", prevEl: "#review_list_slider_prev" }}
      className="review_list"
    >
      {reviews.map((item) => {
        const tooltipId = `review-tooltip-${item.id}`;

        return (
          <SwiperSlide key={item.id}>
            <article className="flex w-[326px] flex-col justify-between gap-3 rounded-sm border border-stroke-grey bg-background px-3 py-6">
              <header className="relative flex items-start justify-between">
                <Link
                  href={item.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 cursor-pointer"
                  aria-label={`Leggi la recensione di ${item.clientName} su Google`}
                />
                <SmartImage src={iconQuote} alt="Quote Icon" width={26} height={23} aria-hidden />

                <div className="flex flex-col">
                  <p className="helper_text text-text-grey">{formatDate(item.date)}</p>
                  <StarsRating rating={item.rating} />
                </div>
              </header>
              <div className="flex flex-col gap-2">
                <p
                  className="input_R_18 line-clamp-3"
                  data-tooltip-id={tooltipId}
                  data-tooltip-content={item.reviewText}
                >
                  {item.reviewText}
                </p>
                <Tooltip id={tooltipId} place="left" style={{ zIndex: 1000, maxWidth: 500, height: "auto" }} />

                <h3 className="input_R_18 ml-auto">{item.clientName}</h3>
              </div>
            </article>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

