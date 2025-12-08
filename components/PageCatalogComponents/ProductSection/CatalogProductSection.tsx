"use client";

import { getAllProducts } from "@/app/actions/product/get-all-products";
import CardProduct from "@/components/ProductCard/CardProduct";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import styles from "./product.module.css";
import { SORT_OPTIONS_PARAMS } from "@/types/catalog-filter-options.types";
import { useQueryState } from "nuqs";
import { Product } from "@/db/schemas/product-schema";

export default function CatalogProductSection({ className }: { className?: string }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [sortParam] = useQueryState(SORT_OPTIONS_PARAMS.PARAM_NAME);
  const [activePage, setActivePage] = useState(1);
  const maxPages = 5;

  useEffect(() => {
    console.log({ sortParam });

    const fetchProducts = async () => {
      const response = await getAllProducts();
      if (response) {
        setProducts(response.data);
      }
      try {
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [sortParam]);

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
          disabled={activePage === 1}
          className={twMerge(
            "flex items-center gap-2 px-3 py-2",
            activePage === 1 && "cursor-not-allowed opacity-50",
          )}
          onClick={() => {
            setActivePage((prev) => {
              if (prev === 1) return 1;
              return prev - 1;
            });
          }}
        >
          <IconRow className="rotate-180" /> <span className="hidden md:block">Precedente</span>
        </button>

        {Array.from({ length: maxPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={twMerge(
              "flex size-8 items-center justify-center rounded-sm",
              activePage === pageNum && "cursor-not-allowed bg-yellow-500 text-black",
            )}
            disabled={activePage === pageNum}
            onClick={() => setActivePage(pageNum)}
          >
            <span> {pageNum} </span>
          </button>
        ))}

        <button
          type="button"
          className={twMerge(
            "flex items-center gap-2 px-3 py-2",
            activePage === maxPages && "cursor-not-allowed opacity-50",
          )}
          disabled={activePage === maxPages}
          onClick={() =>
            setActivePage((prev) => {
              if (prev === maxPages) return maxPages;

              return prev + 1;
            })
          }
        >
          <span className="hidden md:block">Successivo</span> <IconRow />
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
