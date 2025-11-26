"use client";

import { signOutUser } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

const dashboardLinks = [
  { href: "/admin/dashboard/products", title: "Товари" },
  { href: "/admin/dashboard/brands", title: "Бренди" },
  { href: "/admin/dashboard/categories", title: "Категорії" },
  { href: "/admin/dashboard/orders", title: "Замовлення" },
  { href: "/admin/dashboard/customers", title: "Клієнти" },
  { href: "/admin/dashboard/stock", title: "Склад" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b bg-background px-6 py-3">
        <nav className="w-full justify-between">
          <Link href="/admin/dashboard">Admin Dashboard</Link>
        </nav>
        <form action={signOutUser}>
          <button type="submit" className="hover:text-amber-600">
            Вийти
          </button>
        </form>
      </header>
      <div className="flex flex-1">
        <aside className="flex flex-col gap-4 overflow-y-scroll bg-background p-6 text-sm font-medium [&>a:hover]:text-amber-600">
          {dashboardLinks.map((link) => (
            <Link
              className={twMerge(path.includes(link.href) && "text-yellow-400 underline")}
              key={link.href}
              href={link.href}
            >
              {link.title}
            </Link>
          ))}
        </aside>
        <div className="flex flex-1">{children}</div>
      </div>
    </div>
  );
}
