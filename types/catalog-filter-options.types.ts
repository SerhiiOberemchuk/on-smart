import { filtersSchema } from "@/db/schemas/filters-schema.schema";

export type FilterOption = {
  value: string;
  label: string;
  characteristic_value_id?: string;
};

export type FilterGroup = typeof filtersSchema.$inferInsert;

const SORT_OPTIONS = [
  { value: "new", label: "Novita" },
  { value: "price-asc", label: "Prezzo piu basso" },
  { value: "price-desc", label: "Prezzo piu alto" },
] as const;

export type SortOptionValues = (typeof SORT_OPTIONS)[number]["value"];

export const SORT_OPTIONS_PARAMS = {
  PARAM_NAME: "sort",
  options: SORT_OPTIONS,
} as const;
