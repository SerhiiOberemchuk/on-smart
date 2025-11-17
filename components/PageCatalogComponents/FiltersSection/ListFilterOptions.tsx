"use client";

import { CATALOG_FILTERS_PARAMS, FilterGroup } from "@/types/catalog-filter-options.types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import icon_arrow_top from "@/assets/icons/arrow-top.svg";
import { useEffect, useRef, useState } from "react";
import { LabelInput } from "./sub-component/LabelInput";
import { InputRange } from "./sub-component/InputRange";
import { usePathname, useRouter } from "next/navigation";

export default function ListFiltereOptions({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <ul className={twMerge("flex w-full max-w-[264px] flex-col", className)}>
      {CATALOG_FILTERS_PARAMS.map((filter) => (
        <li key={filter.param}>
          <ItemFilteredOptions {...filter} />
        </li>
      ))}
      <li>
        <button
          type="button"
          className="input_M_18 mx-auto flex text-center underline"
          onClick={() => {
            router.push(pathname, { scroll: false });
          }}
        >
          Azzera filtri
        </button>
      </li>
    </ul>
  );
}

export function ItemFilteredOptions(props: FilterGroup) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ulRef.current) {
      setScrollHeight(ulRef.current.scrollHeight);
    }
  }, [scrollHeight]);
  return (
    <fieldset className="">
      <legend
        onClick={() => setIsOpen(!isOpen)}
        className="input_M_18 flex w-full items-center justify-between py-3 hover:text-yellow-500"
      >
        <span>{props.title}</span>
        <Image
          src={icon_arrow_top}
          alt="arrow top"
          className={twMerge("transition-all duration-300", isOpen ? "rotate-x-0" : "rotate-x-180")}
          width={24}
          height={24}
          aria-label="arrow top"
        />
      </legend>

      <ul
        ref={ulRef}
        style={{
          maxHeight: isOpen ? scrollHeight : 0,
        }}
        className={twMerge(
          "flex flex-col gap-3 overflow-hidden transition-[max-height] duration-300 ease-in-out",
        )}
      >
        {props.type === "checkbox" &&
          props.options?.map((option) => (
            <li key={option.value}>
              <LabelInput {...option} param={props.param} />
            </li>
          ))}
        {props.type === "range" && <InputRange {...props} />}
      </ul>
    </fieldset>
  );
}
