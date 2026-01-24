"use client";

import { SORT_OPTIONS_PARAMS } from "@/types/catalog-filter-options.types";
import { useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";

import icon_arrow_top from "@/assets/icons/arrow-top.svg";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { testDbConnection } from "@/app/actions/test-db-conection";

export default function HeaderCatalogo() {
  const refUl = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const testDB = async () => {
      const resp = await testDbConnection();
      console.log("DB TEST:", resp);
    };
    testDB();
  }, []);

  const [sortParam, setSortParam] = useQueryState(SORT_OPTIONS_PARAMS.PARAM_NAME, {
    defaultValue: SORT_OPTIONS_PARAMS.options[0].value,
    clearOnDefault: false,
  });

  const [heightUl, setHeightUl] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (refUl.current) setHeightUl(refUl.current.scrollHeight);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refUl.current && !refUl.current.parentElement?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <header className="bg-background">
      <div className="helper_text container flex w-full flex-wrap items-center justify-between gap-3 py-3 text-text-grey">
        <span className="shrink-0">97 prodotti</span>
        <div className="relative">
          <button
            aria-expanded={isOpen}
            aria-controls="sort-options"
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex min-w-64 items-center gap-2 hover:text-white"
          >
            <span className="shrink-0">Ordina per:</span>
            <span className="shrink-0">
              {SORT_OPTIONS_PARAMS.options.find((option) => option.value === sortParam)?.label ||
                SORT_OPTIONS_PARAMS.options[0].label}
            </span>
            <Image
              src={icon_arrow_top}
              alt="arrow top"
              className={twMerge(
                "ml-auto transition-all duration-300",
                isOpen ? "" : "rotate-x-180",
              )}
            />
          </button>
          <ul
            id="sort-options"
            role="listbox"
            ref={refUl}
            style={{
              maxHeight: isOpen ? heightUl : 0,
            }}
            className="helper_text absolute top-9 right-0 z-500 flex w-fit min-w-40 flex-col gap-1 overflow-hidden rounded-sm bg-grey-hover-stroke transition-all duration-300"
          >
            {SORT_OPTIONS_PARAMS.options.map((option, i) => (
              <li
                role="option"
                aria-selected={sortParam === option.value}
                onClick={() => {
                  //   setSelectedSortOption(option);
                  setSortParam(option.value);
                  setIsOpen(false);
                }}
                className={twMerge(
                  "cursor-pointer p-0.5 transition-all duration-300 hover:text-white",
                  i % 2 !== 0 && "bg-stroke-grey",
                  sortParam === option.value && "text-yellow-400",
                )}
                key={option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
