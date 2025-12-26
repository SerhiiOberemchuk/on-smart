"use client";

import {
  //  debounce,
  parseAsArrayOf,
  parseAsString,
  useQueryState,
} from "nuqs";
import { FilterGroup, FilterOption } from "@/types/catalog-filter-options.types";

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
  const idLabel = `${option.param}__${option.value}`;
  return (
    <label
      htmlFor={idLabel}
      className="flex cursor-pointer items-center gap-2 hover:text-yellow-500"
    >
      <input id={idLabel} type="checkbox" checked={checked} onChange={handleChange} />
      <span className="text_R">{option.label}</span>
      {/* <span>{"(5)"}</span> */}
    </label>
  );
}
