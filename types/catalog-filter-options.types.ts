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

export const CATALOG_FILTERS_PARAMS: FilterGroup[] = [
  {
    param: "category",
    title: "Categoria",
    type: "checkbox",
    options: [
      { value: "fotocamere", label: "Fotocamere" },
      { value: "videocamere", label: "Videocamere" },
      { value: "sistemi-di-sorveglianza", label: "Sistemi di sorveglianza" },
    ],
  },
  {
    param: "brand",
    title: "Brand",
    type: "checkbox",
    options: [
      { value: "ajax", label: "Ajax Systems" },
      { value: "uniview", label: "Uniview" },
      { value: "mach-power", label: "MachPower" },
    ],
  },
  {
    param: "price",
    title: "Prezzo, Euro €",
    type: "range",
    min: 1,
    max: 99999,
  },
  {
    param: "risoluzione",
    title: "Risoluzione",
    type: "checkbox",
    options: [
      { value: "2mp", label: "2MP" },
      { value: "4mp", label: "4MP" },
      { value: "5mp", label: "5MP" },
    ],
  },
];

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
