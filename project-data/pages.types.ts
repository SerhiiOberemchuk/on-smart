export type Pages =
  | "/home"
  | "/catalogo"
  | "/chi-siamo"
  | "/pagamento"
  | "/spedizione"
  | "/garanzia";

export const list_nav: {
  href: Pages;
  label: string;
}[] = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/spedizione", label: "Spedizione" },
  { href: "/garanzia", label: "Garanzia" },
];
