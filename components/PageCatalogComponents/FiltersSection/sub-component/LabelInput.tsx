"use client";

import {
  //  debounce,
  parseAsArrayOf,
  parseAsString,
  useQueryState,
} from "nuqs";
import { FilterGroup, FilterOption } from "@/types/catalog-filter-options.types";
import Image from "next/image";

import icon_checkbox from "@/assets/icons/checkbox-non.svg";
import icon_checked from "@/assets/icons/checkbox.svg";

export function LabelInput(option: FilterOption & Pick<FilterGroup, "param">) {
  const [sortParam, setSortParam] = useQueryState(
    option.param,
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const checked = sortParam?.includes(option.value);

  const handleChange = () => {
    const updatedSortParam = checked
      ? sortParam.filter((v) => v !== option.value)
      : [...(sortParam || []), option.value];
    setSortParam(
      updatedSortParam.length > 0 ? updatedSortParam : null,
      //  {      limitUrlUpdates: debounce(1000),    }
    );
  };

  return (
    <label
      htmlFor={option.value}
      className="flex cursor-pointer items-center gap-2 hover:text-yellow-500"
    >
      <Image
        src={checked ? icon_checked : icon_checkbox}
        width={16}
        height={16}
        alt="checkbox"
        aria-hidden="true"
      />
      <span className="text_R">{option.label}</span>
      <input
        id={option.value}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
      />
      <span>{"(5)"}</span>
    </label>
  );
}
