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
  return (
    <div className={twMerge("flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-6", className)}>
      <Image
        src={data.images[0]}
        className="flex-1 rounded-sm"
        alt={data.images[0] + data.title}
        width={670}
        height={670}
      />
      <div className="flex flex-1 flex-col gap-3 rounded-sm bg-background p-3">
        <h2 className="H4M">{data.title}</h2>
        <ul className="mt-1 flex flex-col gap-3">
          {data.groups.map((item, index) => (
            <li key={item.groupTitle + index} className="flex flex-col gap-1">
              <h3 className="H5 p-1">{item.groupTitle}</h3>

              <ul className="flex flex-col">
                {item.items.map((subItem, index) => (
                  <li
                    key={subItem.name + index}
                    className="text_R flex justify-between px-1 py-2 odd:bg-grey-hover-stroke even:bg-transparent"
                  >
                    <span className="text-text-grey">{subItem.name}:</span>{" "}
                    <span className="uppercase">{subItem.value}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
