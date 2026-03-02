"use client";

import {
  getGlobalSearchResults,
  type GlobalSearchResults,
} from "@/app/actions/search/get-global-search-results";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const EMPTY_RESULTS: GlobalSearchResults = {
  products: [],
  brands: [],
  categories: [],
};
const MAX_CACHED_SEARCHES = 50;

function getProductHref(product: GlobalSearchResults["products"][number]) {
  if (product.productType === "bundle") {
    return `/catalogo/${encodeURIComponent(product.category_slug)}/${encodeURIComponent(product.brand_slug)}/bundle/${encodeURIComponent(product.slug)}`;
  }

  return `/catalogo/${encodeURIComponent(product.category_slug)}/${encodeURIComponent(product.brand_slug)}/${encodeURIComponent(product.slug)}`;
}

function getBrandHref(brandSlug: string) {
  return `/catalogo?${new URLSearchParams({ brand: brandSlug }).toString()}`;
}

function getCategoryHref(categorySlug: string) {
  return `/catalogo?${new URLSearchParams({ categoria: categorySlug }).toString()}`;
}

function SearchSection({ title, items }: { title: string; items: ReactNode[] }) {
  if (!items.length) return null;

  return (
    <div>
      <p className="px-3 py-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
        {title}
      </p>
      <ul className="divide-y divide-neutral-800">{items}</ul>
    </div>
  );
}

export default function Search({
  mobile = false,
  onNavigate,
  autoFocus,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const inputId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef<Map<string, GlobalSearchResults>>(new Map());
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    (() => {
      setIsOpen(false);
      setActiveIndex(-1);
    })();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const cacheKey = normalizedQuery.toLowerCase();
    if (normalizedQuery.length < 2) {
      (() => {
        setIsOpen(false);
        setResults(EMPTY_RESULTS);
        setActiveIndex(-1);
      })();

      return;
    }

    setActiveIndex(-1);
    const currentRequestId = ++requestIdRef.current;
    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setResults(cached);
          setIsOpen(true);
          return;
        }

        const response = await getGlobalSearchResults(normalizedQuery);
        if (currentRequestId !== requestIdRef.current) return;

        if (!response.success) {
          setResults(EMPTY_RESULTS);
          setIsOpen(false);
          return;
        }

        const nextResults = response.data ?? EMPTY_RESULTS;
        cacheRef.current.set(cacheKey, nextResults);
        if (cacheRef.current.size > MAX_CACHED_SEARCHES) {
          const firstInsertedKey = cacheRef.current.keys().next().value;
          if (firstInsertedKey) {
            cacheRef.current.delete(firstInsertedKey);
          }
        }
        setResults(nextResults);
        setIsOpen(true);
        setActiveIndex(-1);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const allResultItems = [
    ...results.products.map((item) => ({
      key: item.id,
      href: getProductHref(item),
    })),
    ...results.brands.map((item) => ({
      key: item.id,
      href: getBrandHref(item.brand_slug),
    })),
    ...results.categories.map((item) => ({
      key: item.id,
      href: getCategoryHref(item.category_slug),
    })),
  ];
  const hasResults = allResultItems.length > 0;

  const firstResultHref = allResultItems[0]?.href ?? null;
  const currentActiveHref =
    activeIndex >= 0 && activeIndex < allResultItems.length
      ? allResultItems[activeIndex].href
      : null;

  const handleNavigate = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery("");
    onNavigate?.();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!allResultItems.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev >= allResultItems.length - 1 ? 0 : prev + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? allResultItems.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      const targetHref = currentActiveHref || firstResultHref;
      if (!targetHref) return;
      router.push(targetHref);
      handleNavigate();
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetHref = currentActiveHref || firstResultHref;
    if (!targetHref) return;
    router.push(targetHref);
    handleNavigate();
  };

  return (
    <div
      ref={rootRef}
      className={twMerge(
        "relative w-auto max-w-[440px] flex-1",
        mobile ? "mx-0 block w-full max-w-none" : "hidden sm:mx-4 sm:block md:mx-6",
      )}
    >
      <form action="#" onSubmit={onSubmit}>
        <button
          type="submit"
          className="absolute top-1/2 left-5 -translate-y-1/2 cursor-pointer"
          aria-label="Search"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21.0002L16.657 16.6572M16.657 16.6572C17.3998 15.9143 17.9891 15.0324 18.3912 14.0618C18.7932 13.0911 19.0002 12.0508 19.0002 11.0002C19.0002 9.9496 18.7932 8.90929 18.3912 7.93866C17.9891 6.96803 17.3998 6.08609 16.657 5.34321C15.9141 4.60032 15.0321 4.01103 14.0615 3.60898C13.0909 3.20693 12.0506 3 11 3C9.94936 3 8.90905 3.20693 7.93842 3.60898C6.96779 4.01103 6.08585 4.60032 5.34296 5.34321C3.84263 6.84354 2.99976 8.87842 2.99976 11.0002C2.99976 13.122 3.84263 15.1569 5.34296 16.6572C6.84329 18.1575 8.87818 19.0004 11 19.0004C13.1217 19.0004 15.1566 18.1575 16.657 16.6572Z"
              stroke="#F9F8F8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <label htmlFor={inputId} className="sr-only">
          Cerca prodotti, brand e categorie
        </label>
        <input
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-search-results`}
          aria-activedescendant={
            activeIndex >= 0 ? `${inputId}-search-option-${activeIndex}` : undefined
          }
          type="text"
          id={inputId}
          name="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Cerca prodotti, brand, categorie..."
          className="w-full rounded border border-stroke-grey py-2.5 pr-4 pl-12 font-normal text-white placeholder:text-white autofill:bg-blue-700 focus:ring-2 focus:ring-yellow-600 focus:outline-none"
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>

      {isOpen ? (
        <div
          id={`${inputId}-search-results`}
          role="listbox"
          className="absolute top-full right-0 left-0 z-1100 mt-2 max-h-[70vh] overflow-auto rounded border border-neutral-700 bg-neutral-900 shadow-xl"
        >
          {isPending ? (
            <p className="px-3 py-3 text-sm text-neutral-300">Ricerca in corso...</p>
          ) : hasResults ? (
            <div className="divide-y divide-neutral-800">
              <SearchSection
                title="Prodotti"
                items={results.products.map((item, index) => {
                  const listIndex = index;
                  const isActive = activeIndex === listIndex;
                  return (
                    <li
                      key={item.id}
                      id={`${inputId}-search-option-${listIndex}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Link
                        href={getProductHref(item)}
                        className={twMerge(
                          "block px-3 py-2 hover:bg-neutral-800",
                          isActive && "bg-neutral-800",
                        )}
                        onMouseEnter={() => setActiveIndex(listIndex)}
                        onClick={handleNavigate}
                      >
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-neutral-400">
                          {item.category_slug} | {item.brand_slug} | EAN: {item.ean}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              />

              <SearchSection
                title="Brand"
                items={results.brands.map((item, index) => {
                  const listIndex = results.products.length + index;
                  const isActive = activeIndex === listIndex;
                  return (
                    <li
                      key={item.id}
                      id={`${inputId}-search-option-${listIndex}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Link
                        href={getBrandHref(item.brand_slug)}
                        className={twMerge(
                          "block px-3 py-2 hover:bg-neutral-800",
                          isActive && "bg-neutral-800",
                        )}
                        onMouseEnter={() => setActiveIndex(listIndex)}
                        onClick={handleNavigate}
                      >
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-neutral-400">Brand: {item.brand_slug}</p>
                      </Link>
                    </li>
                  );
                })}
              />

              <SearchSection
                title="Categorie"
                items={results.categories.map((item, index) => {
                  const listIndex = results.products.length + results.brands.length + index;
                  const isActive = activeIndex === listIndex;
                  return (
                    <li
                      key={item.id}
                      id={`${inputId}-search-option-${listIndex}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Link
                        href={getCategoryHref(item.category_slug)}
                        className={twMerge(
                          "block px-3 py-2 hover:bg-neutral-800",
                          isActive && "bg-neutral-800",
                        )}
                        onMouseEnter={() => setActiveIndex(listIndex)}
                        onClick={handleNavigate}
                      >
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-neutral-400">Categoria: {item.category_slug}</p>
                      </Link>
                    </li>
                  );
                })}
              />
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-neutral-400">Nessun risultato trovato.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
