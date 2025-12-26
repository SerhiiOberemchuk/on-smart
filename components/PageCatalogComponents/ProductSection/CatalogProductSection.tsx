"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { parseAsInteger, useQueryState } from "nuqs";

import CardProduct from "@/components/ProductCard/CardProduct";
import styles from "./product-catalogo.module.css";

import { FilterGroup, SORT_OPTIONS_PARAMS } from "@/types/catalog-filter-options.types";
import { ProductType } from "@/db/schemas/product.schema";
import { getCatalogFilters } from "@/lib/get-catalog-filters";
import {
  CatalogQueryPayload,
  getAllProductsFiltered,
} from "@/app/actions/product/get-all-products-filtered";

export default function CatalogProductSection({ className }: { className?: string }) {
  const [products, setProducts] = useState<ProductType[] | null>(null);
  const [allFilters, setAllFilters] = useState<FilterGroup[]>();
  const [pages, setPages] = useState<{ page: number; totalPages: number }>({
    page: 1,
    totalPages: 1,
  });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const changePage = useCallback(
    (nextPage: number) => {
      setPage(nextPage <= 1 ? null : nextPage, { scroll: false });
    },
    [setPage],
  );

  useEffect(() => {
    const fetch = async () => {
      const res = await getCatalogFilters();
      setAllFilters(res);
    };
    fetch();
  }, []);

  const searchParams = useSearchParams();

  const payload = useMemo<CatalogQueryPayload>(() => {
    if (!allFilters) return {};

    const categorySlugs: string[] = [];
    const brandSlugs: string[] = [];
    const characteristics: Record<string, string[]> = {};

    allFilters.forEach((filter) => {
      if (filter.type !== "checkbox") return;

      const rawValue = searchParams.get(filter.param);
      if (!rawValue) return;

      const selectedSlugs = rawValue.split(",");

      if (filter.param === "categoria") {
        categorySlugs.push(...selectedSlugs);
        return;
      }

      if (filter.param === "brand") {
        brandSlugs.push(...selectedSlugs);
        return;
      }

      const valueIds =
        filter.options
          ?.filter((opt) => selectedSlugs.includes(opt.value))
          .map((opt) => opt.characteristic_value_id)
          .filter((id): id is string => Boolean(id)) ?? [];

      if (valueIds.length) {
        characteristics[filter.param] = valueIds;
      }
    });

    const priceRaw = searchParams.get("price");
    const [minRaw, maxRaw] = priceRaw?.split(",") ?? [];

    const min = minRaw ? Number(minRaw) : undefined;
    const max = maxRaw ? Number(maxRaw) : undefined;

    const sort =
      (searchParams.get(SORT_OPTIONS_PARAMS.PARAM_NAME) as CatalogQueryPayload["sort"]) ?? "new";

    return {
      categorySlugs,
      brandSlugs,
      characteristics,
      price: {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
      },
      sort,
      page,
    };
  }, [searchParams, allFilters, page]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getAllProductsFiltered(payload);
      if (!response) return;

      setProducts(response.data);
      setPages({
        page: response.meta.page,
        totalPages: response.meta.totalPages,
      });

      if (response.meta.page !== page) {
        changePage(response.meta.page);
      }
    };

    fetchProducts();
  }, [payload, page, changePage]);
  return (
    <section className={twMerge("flex-1", className)}>
      {products && (
        <ul className={styles.list}>
          {products.map((product) => (
            <CardProduct key={product.id} {...product} className={styles.card} />
          ))}
        </ul>
      )}

      <nav className="mx-auto mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={pages.page === 1}
          className={twMerge(
            "flex items-center gap-2 px-3 py-2",
            pages.page === 1 && "cursor-not-allowed opacity-50",
          )}
          onClick={() => changePage(pages.page - 1)}
        >
          <IconRow className="rotate-180" />
          <span className="hidden md:block">Precedente</span>
        </button>

        {Array.from({ length: pages.totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={twMerge(
              "flex size-8 items-center justify-center rounded-sm",
              pages.page === pageNum && "cursor-not-allowed bg-yellow-500 text-black",
            )}
            disabled={pages.page === pageNum}
            onClick={() => changePage(pageNum)}
          >
            <span>{pageNum}</span>
          </button>
        ))}

        <button
          type="button"
          disabled={pages.page === pages.totalPages}
          className={twMerge(
            "flex items-center gap-2 px-3 py-2",
            pages.page === pages.totalPages && "cursor-not-allowed opacity-50",
          )}
          onClick={() => changePage(pages.page + 1)}
        >
          <span className="hidden md:block">Successivo</span>
          <IconRow />
        </button>
      </nav>
    </section>
  );
}

function IconRow({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge("k", className)}
    >
      <path
        d="M3.33301 8.00016H12.6663M12.6663 8.00016L7.99967 3.3335M12.6663 8.00016L7.99967 12.6668"
        stroke="#F9F8F8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
