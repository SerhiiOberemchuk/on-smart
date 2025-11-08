import Image from "next/image";
import starfull from "@/assets/icons/star-full.svg";
import starempty from "@/assets/icons/star-empty.svg";
import { Product } from "@/types/product.types";

export default function StarsRating({ rating }: Pick<Product, "rating">) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Image src={rating >= i + 1 ? starfull : starempty} key={i} alt="Star " aria-hidden />
      ))}
    </div>
  );
}
