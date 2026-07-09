import LogoLink from "../../components/LogoLink";
import Navigation from "../../components/Navigation";
import Search from "./components/Search";
import Cart from "./components/Cart";
import MobileMenu from "./components/MobileMenu";
import SearchMobile from "./components/SearchMobile";
import AccountButton, { AccountButtonSkeleton } from "./components/AccountButton";
import { Suspense } from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-header-footer-100 py-4 shadow-md">
      
      <div className="container flex items-center">
        <LogoLink />
        <div className="ml-auto flex max-w-2xl flex-wrap items-center sm:w-full xl:max-w-6xl">
          <Suspense>
            <Navigation />
          </Suspense>
          <Suspense>
            <Search />
          </Suspense>
          <SearchMobile />
          <Suspense fallback={<AccountButtonSkeleton />}>
            <AccountButton />
          </Suspense>
          <Cart />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
