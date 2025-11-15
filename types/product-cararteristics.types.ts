export const TABS_CHARACTERISTICS = [
  { title: "Descrizione", searchParam: "descrizione" },
  { title: "Specifiche", searchParam: "specifiche" },
  { title: "Documenti", searchParam: "documenti" },
  { title: "Valutazione", searchParam: "valutazione" },
] as const;
export const DEFAULT_TAB_CHARACTERISTICS: TabTypeCaracteristics = "descrizione";
export type TabTypeCaracteristics = (typeof TABS_CHARACTERISTICS)[number]["searchParam"];
export const TAB_QUERY_PARAM = "tab" as const;
