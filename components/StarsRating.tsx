import Image from "next/image";
import starfull from "@/assets/icons/star-full.svg";
import starempty from "@/assets/icons/star-empty.svg";
import { Product } from "@/types/product.types";
import { twMerge } from "tailwind-merge";
import { MAX_RATING } from "@/constans";

export default function StarsRating({
  rating,
  className,
}: Pick<Product, "rating"> & { className?: string }) {
  return (
    <div className={twMerge("flex gap-1", className)}>
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <Image src={rating >= i + 1 ? starfull : starempty} key={i} alt="Star " aria-hidden />
      ))}
    </div>
  );
}
