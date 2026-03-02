import {
  CatalogQueryPayload,
  CatalogSort,
} from "@/app/actions/product/get-all-products-filtered";
import { FilterGroup, SORT_OPTIONS_PARAMS } from "@/types/catalog-filter-options.types";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

function getSingleSearchParam(
  value: CatalogSearchParams[string],
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseCatalogPage(searchParams: CatalogSearchParams): number {
  const rawPage = getSingleSearchParam(searchParams.page);
  const page = Number(rawPage);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.trunc(page);
}

export function parseCatalogSort(searchParams: CatalogSearchParams): CatalogSort {
  const sortRaw = getSingleSearchParam(searchParams[SORT_OPTIONS_PARAMS.PARAM_NAME]);
  const allowedSorts = new Set(SORT_OPTIONS_PARAMS.options.map((item) => item.value));
  if (sortRaw && allowedSorts.has(sortRaw as CatalogSort)) {
    return sortRaw as CatalogSort;
  }
  return "new";
}

export function buildCatalogPayloadFromSearchParams({
  allFilters,
  searchParams,
  page = parseCatalogPage(searchParams),
}: {
  allFilters: FilterGroup[];
  searchParams: CatalogSearchParams;
  page?: number;
}): CatalogQueryPayload {
  const categorySlugs: string[] = [];
  const brandSlugs: string[] = [];
  const characteristics: Record<string, string[]> = {};

  allFilters.forEach((filter) => {
    if (filter.type !== "checkbox") return;

    const selectedSlugs = parseCsv(getSingleSearchParam(searchParams[filter.param]));
    if (!selectedSlugs.length) return;

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
        ?.filter((option) => selectedSlugs.includes(option.value))
        .map((option) => option.characteristic_value_id)
        .filter((id): id is string => Boolean(id)) ?? [];

    if (valueIds.length) {
      characteristics[filter.param] = valueIds;
    }
  });

  const [minRaw, maxRaw] = parseCsv(getSingleSearchParam(searchParams.price));
  const min = minRaw ? Number(minRaw) : undefined;
  const max = maxRaw ? Number(maxRaw) : undefined;

  return {
    categorySlugs,
    brandSlugs,
    characteristics,
    price: {
      min: Number.isFinite(min) ? min : undefined,
      max: Number.isFinite(max) ? max : undefined,
    },
    sort: parseCatalogSort(searchParams),
    page,
    mode: "all",
  };
}

export function hasCatalogFiltersApplied({
  allFilters,
  searchParams,
}: {
  allFilters: FilterGroup[];
  searchParams: CatalogSearchParams;
}): boolean {
  return allFilters.some((filter) => {
    const value = getSingleSearchParam(searchParams[filter.param]);
    if (!value) return false;
    return parseCsv(value).length > 0;
  });
}
