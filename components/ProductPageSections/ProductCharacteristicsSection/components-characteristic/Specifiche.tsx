import { Product_Details } from "@/types/product.types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export default function Specifiche({
  data,
  className,
}: {
  data: Product_Details["characteristics_specifiche"];
  className?: string;
}) {
  const imagesToRender = data.images.length > 1 ? data.images.slice(0, 4) : data.images;
  return (
    <div className={twMerge("flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-6", className)}>
      {imagesToRender.length === 1 && (
        <Image
          src={imagesToRender[0]}
          className="mx-auto rounded-sm"
          alt={data.title}
          width={670}
          height={670}
        />
      )}
      {imagesToRender.length > 1 && (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-6 xl:flex-1">
          {imagesToRender.map((img, idx) => (
            <Image
              key={img + idx}
              src={img}
              className="flex-1 rounded-sm"
              alt={img + data.title}
              width={670}
              height={670}
            />
          ))}
        </ul>
      )}
      <div className="flex flex-1 flex-col gap-3 rounded-sm bg-background p-3">
        <h2 className="H4M">{data.title}</h2>
        <ul className="mt-1 flex flex-col gap-3">
          {data.groups
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((item, index) => (
              <li
                key={item.name + index}
                className="text_R flex justify-between px-1 py-2 odd:bg-grey-hover-stroke even:bg-transparent"
              >
                <span className="text-text-grey">{item.name}:</span>{" "}
                <span className="uppercase">{item.value}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
