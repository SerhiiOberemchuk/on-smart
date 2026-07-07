import type { AccountIconName } from "./AccountNavIcon";

export const ACCOUNT_LINKS: {
  href: string;
  label: string;
  icon: AccountIconName;
}[] = [
  { href: "/account/ordini", label: "I miei ordini", icon: "orders" },
  { href: "/account/profilo", label: "Il mio profilo", icon: "profile" },
  { href: "/account/indirizzi", label: "I miei indirizzi", icon: "address" },
  { href: "/account/preferiti", label: "I miei preferiti", icon: "heart" },
  { href: "/account/recesso", label: "Diritto di recesso", icon: "return" },
];
