"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";

const MAX_VISIBLE_PAGES = 7;

type PaginationItem = number | "dots";

function getVisiblePages(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sortedPages = [...pages]
    .filter((page) => page > 0 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];
  sortedPages.forEach((page, index) => {
    const prev = sortedPages[index - 1];
    if (prev && page - prev > 1) {
      items.push("dots");
    }
    items.push(page);
  });

  return items;
}

export default function CatalogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const changePage = useCallback(
    (nextPage: number) => {
      setPage(nextPage <= 1 ? null : nextPage, { scroll: false, shallow: false });
    },
    [setPage],
  );

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className="mx-auto mt-6 flex items-center justify-center gap-2" aria-label="Pagine catalogo">
      <button
        type="button"
        disabled={page === 1}
        className={twMerge(
          "flex items-center gap-2 px-3 py-2",
          page === 1 && "cursor-not-allowed opacity-50",
        )}
        onClick={() => changePage(page - 1)}
      >
        <IconRow className="rotate-180" />
        <span className="hidden md:block">Precedente</span>
      </button>

      {visiblePages.map((item, index) =>
        item === "dots" ? (
          <span key={`dots-${index}`} className="px-2 text-text-grey">
            ...
          </span>
        ) : (
          <button
            key={item}
            className={twMerge(
              "flex size-8 items-center justify-center rounded-sm",
              page === item && "cursor-not-allowed bg-yellow-500 text-black",
            )}
            disabled={page === item}
            onClick={() => changePage(item)}
          >
            <span>{item}</span>
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page === totalPages}
        className={twMerge(
          "flex items-center gap-2 px-3 py-2",
          page === totalPages && "cursor-not-allowed opacity-50",
        )}
        onClick={() => changePage(page + 1)}
      >
        <span className="hidden md:block">Successivo</span>
        <IconRow />
      </button>
    </nav>
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
      className={twMerge(className)}
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
