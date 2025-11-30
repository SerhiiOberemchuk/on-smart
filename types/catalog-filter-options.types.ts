export type FilterOption = {
  value: string;
  label: string;
};

export type FilterGroup = {
  param: string;
  title: string;
  type: "checkbox" | "range";
  options?: FilterOption[];
  min?: number;
  max?: number;
};

const SORT_OPTIONS = [
  { value: "new", label: "Novita" },
  { value: "price-asc", label: "Prezzo più alto" },
  { value: "price-desc", label: "Prezzo più basso" },
] as const;

export type SortOptionValues = (typeof SORT_OPTIONS)[number]["value"];

export const SORT_OPTIONS_PARAMS = {
  PARAM_NAME: "sort",
  options: SORT_OPTIONS,
} as const;
