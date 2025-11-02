import LogoLink from "../../components/LogoLink";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Cart from "./components/Cart";
import MobileMenu from "./components/MobileMenu";
import SearchMobile from "./components/SearchMobile";

export default function Header() {
  return (
    <header className="bg-header-footer py-4">
      <div className="container flex items-center">
        <LogoLink />
        <div className="ml-auto flex max-w-2xl flex-wrap items-center sm:w-full xl:max-w-6xl">
          <Navigation />
          <Search />
          <SearchMobile />
          <Cart />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
