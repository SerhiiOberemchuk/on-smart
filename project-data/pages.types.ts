export type Pages =
  | "/home"
  | "/catalogo"
  | "/ci-siamo"
  | "/pagamento"
  | "/spedizione"
  | "/garanzia";

export const list_nav: {
  href: Pages;
  label: string;
}[] = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/ci-siamo", label: "Ci siamo" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/spedizione", label: "Spedizione" },
  { href: "/garanzia", label: "Garanzia" },
];
