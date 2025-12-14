import { Product_Details } from "@/types/product.types";
import icon_download from "@/assets/icons/icon_download.svg";
import icon_document from "@/assets/icons/icon_file.svg";
import Link from "next/link";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
export default function Documenti({
  data,
  className,
}: {
  data: Product_Details["characteristics_documenti"];
  className?: string;
}) {
  return (
    <div className={twMerge("flex flex-col gap-3", className)}>
      {data &&
        data.documents.length &&
        data.documents.map((item) => {
          return (
            <Link
              href={item.link}
              key={item.title}
              download={true}
              className="flex items-center gap-1 hover:text-yellow-500"
              rel="noopener noreferrer"
            >
              <Image src={icon_document} alt="Document icon" /> {item.title}
              <Image src={icon_download} alt="Download icon" />
            </Link>
          );
        })}
    </div>
  );
}
