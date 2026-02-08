import { Product_Details } from "@/types/product.types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export default function Descrizione({
  data,
  className,
}: {
  data: Product_Details["characteristics_descrizione"];
  className?: string;
}) {
  const imagesToRender = data.images.length > 1 ? data.images.slice(0, 1) : data.images;
  return (
    <div className={twMerge("flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-6", className)}>
      {imagesToRender.length === 1 && (
        <Image
          src={imagesToRender[0]}
          className="mx-auto rounded-sm"
          alt={data.title}
          width={664}
          height={664}
        />
      )}
      {imagesToRender.length > 1 && (
        <ul className="mx-auto grid flex-1 grid-cols-2 grid-rows-2 gap-1 xl:gap-5">
          {imagesToRender.map((image) => (
            <li key={image}>
              <Image
                src={image}
                className="mx-auto rounded-sm"
                alt={data.title}
                width={324}
                height={324}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-1 flex-col gap-3 rounded-sm bg-background p-3 xl:h-auto xl:gap-6">
        <h3 className="H4M">{data.title}</h3>
        <p className="text_R">{data.description}</p>
      </div>
    </div>
  );
}
