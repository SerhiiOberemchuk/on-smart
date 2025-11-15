import StarsRating from "@/components/StarsRating";
import { Product_Details } from "@/types/product.types";
import { Swiper, SwiperSlide } from "swiper/react";
import { twMerge } from "tailwind-merge";
import "swiper/css";
import { Navigation } from "swiper/modules";
export default function Valutazione({
  data,
  className,
}: {
  data: Product_Details["characteristics_valutazione"];
  className?: string;
}) {
  const { recensioni } = data;
  const midleRating =
    recensioni.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / recensioni.length || 0;
  return (
    <div className={twMerge("flex flex-col gap-5 xl:flex-row", className)}>
      <div className="rounded-sm bg-background p-3 xl:h-auto xl:flex-1">
        <h2 className="H4M mb-4">Recensioni</h2>
        <div className="mb-4 flex items-center gap-2">
          <StarsRating rating={midleRating} className="" />
          <span>{midleRating.toFixed(1)}</span>
          <span className="text-text-secondary ml-2 text-sm">{`(${recensioni.length})`}</span>
        </div>
        <div className="sr-only flex flex-wrap gap-4 xl:not-sr-only">
          {data.recensioni.map((recensione) => (
            <RecensioneCard key={recensione.clientName} {...recensione} />
          ))}
        </div>
        <div className="@container max-w-full overflow-x-hidden">
          <Swiper
            onClick={(e) => {
              console.log(e);
            }}
            slidesPerView={"auto"}
            spaceBetween={20}
            id="top_products_list_slider"
            modules={[Navigation]}
            // className="flex w-full"
          >
            {data.recensioni.map((recensione) => (
              <SwiperSlide key={recensione.clientName} className="" style={{ width: 288 }}>
                <RecensioneCard {...recensione} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <div className="rounded-sm bg-background p-3 xl:h-auto xl:flex-1"></div>
    </div>
  );
}

function RecensioneCard({
  clientName,
  rating,
  date,
  comment,
}: Product_Details["characteristics_valutazione"]["recensioni"][0]) {
  return (
    <div
      key={clientName}
      className="mb-2 flex w-full max-w-[312px] flex-col gap-3 rounded-sm border border-stroke-grey p-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="input_R_18">{clientName}</h4>
        <span className="helper_text text-text-grey">{date}</span>
      </div>
      <StarsRating rating={rating} className="" />
      <p className="text_R">{comment}</p>
    </div>
  );
}
