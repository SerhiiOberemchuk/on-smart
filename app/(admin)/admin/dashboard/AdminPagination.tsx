"use client";

import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], initialPageSize = 20) {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const setPage = (newPage: number) => {
    setPageState(Math.max(1, Math.min(newPage, totalPages)));
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPageState(1);
  };

  useEffect(() => {
    if (page > totalPages) {
      setPageState(totalPages);
    }
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalPages,
    pageItems,
    setPage,
    setPageSize,
  };
}

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  if (totalItems <= Math.min(...pageSizeOptions)) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="admin-muted text-sm">
        Показано {from}–{to} із {totalItems}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="admin-select"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              по {size}
            </option>
          ))}
        </select>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="admin-btn-secondary disabled:opacity-50"
        >
          Назад
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="admin-btn-secondary disabled:opacity-50"
        >
          Вперед
        </button>
        <div className="admin-muted text-sm">
          Сторінка {page} із {totalPages}
        </div>
      </div>
    </div>
  );
}
