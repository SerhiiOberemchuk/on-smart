import Link from "next/link";
import { Suspense } from "react";
import AccountNavIcon from "./components/AccountNavIcon";
import { ACCOUNT_LINKS } from "./components/account-nav";
import SidebarNav from "./components/SidebarNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex flex-col gap-8 py-8 lg:flex-row">
      <aside
        className="lg:sticky lg:h-fit lg:w-64 lg:shrink-0 lg:self-start"
        style={{ top: "calc(var(--header-height, 96px) + 0.5rem)" }}
      >
        <Suspense fallback={<SidebarFallback />}>
          <SidebarNav />
        </Suspense>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function SidebarFallback() {
  return (
    <nav className="flex flex-col gap-1">
      {ACCOUNT_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 rounded-sm px-4 py-2.5 text-white transition hover:bg-white/5"
        >
          <AccountNavIcon name={link.icon} className="h-5 w-5 shrink-0 text-text-grey" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
