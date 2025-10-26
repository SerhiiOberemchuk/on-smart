import LogoLink from "@/components/LogoLink";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Cart from "./components/Cart";

export default function Header() {
  return (
    <header className="container flex items-center bg-header-footer py-4">
      <LogoLink />
      <Navigation />
      <Search />
      <Cart />
    </header>
  );
}
