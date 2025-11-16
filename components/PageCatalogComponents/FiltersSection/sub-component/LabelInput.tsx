"use client";

import { FilterGroup, FilterOption } from "@/types/catalog-filter-options.types";
import Image from "next/image";

import icon_checkbox from "@/assets/icons/checkbox-non.svg";
import icon_checked from "@/assets/icons/checkbox.svg";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
export function LabelInput(option: FilterOption & Pick<FilterGroup, "param">) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkedInitially = () => {
      const params = new URLSearchParams(searchParams.toString());
      const paramName = option.param;
      const current = params.get(paramName)?.split(",").filter(Boolean) || [];
      setChecked(current.includes(option.value));
    };
    checkedInitially();
  }, [option.value, searchParams, option.param]);

  const handleChange = () => {
    setChecked((prev) => !prev);
    const params = new URLSearchParams(searchParams.toString());
    const paramName = option.param;
    const current = params.get(paramName)?.split(",").filter(Boolean) || [];

    let updated: string[];

    if (!checked) {
      updated = [...current, option.value];
    } else {
      updated = current.filter((v) => v !== option.value);
    }

    if (updated.length > 0) {
      params.set(paramName, updated.join(","));
    } else {
      params.delete(paramName);
    }

    router.push(pathname + "?" + params.toString(), { scroll: false });
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
