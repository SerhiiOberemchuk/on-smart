export type Pages =
  | "/home"
  | "/catalogo"
  | "/chi-siamo"
  | "/pagamento"
  | "/spedizione"
  | "/garanzia"
  | "/informativa-sulla-privacy"
  | "/cookies"
  | "/termini-e-condizioni";

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
export const privacy_nav_links: {
  href: Pages;
  label: string;
}[] = [
  { href: "/informativa-sulla-privacy", label: "Informativa sulla privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/garanzia", label: "Garanzia" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/spedizione", label: "Spedizione e consegna" },
];
