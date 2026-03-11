"use client";

import SmartImage from "@/components/SmartImage";
import icon from "@/assets/icons/icon-comparison.svg";
import { ProductType } from "@/db/schemas/product.schema";

export default function ButtonComparison({ id }: { id: ProductType["id"] }) {
  return (
    <button type="button" className="mr-0 ml-auto">
      <SmartImage
        src={icon}
        alt="Confronta"
        onClick={() => {
          // console.log({ productId: id });
        }}
      />
    </button>
  );
}

