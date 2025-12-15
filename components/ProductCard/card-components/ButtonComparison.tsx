"use client";

import Image from "next/image";
import icon from "@/assets/icons/icon-comparison.svg";
import { ProductType } from "@/db/schemas/product.schema";

export default function ButtonComparison({ id }: { id: ProductType["id"] }) {
  return (
    <button type="button" className="mr-0 ml-auto">
      <Image
        src={icon}
        alt="Confronta"
        onClick={() => {
          console.log({ productId: id });
        }}
      />
    </button>
  );
}
