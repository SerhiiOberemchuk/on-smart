import Link from "next/link";
import { Suspense } from "react";
import { ACCOUNT_LINKS } from "./components/account-nav";
import SidebarNav from "./components/SidebarNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex flex-col gap-8 py-8 lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0">
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
        <Link key={link.href} href={link.href} className="rounded-md px-4 py-2 hover:bg-black/5">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
