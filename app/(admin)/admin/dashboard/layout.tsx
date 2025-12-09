"use client";

import { signOutUser } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { twMerge } from "tailwind-merge";

const dashboardLinks = [
  { href: "/admin/dashboard/products", title: "Товари", active: true },
  { href: "/admin/dashboard/brands", title: "Бренди", active: true },
  { href: "/admin/dashboard/categories", title: "Категорії", active: true },
  { href: "/admin/dashboard/orders", title: "Замовлення", active: false },
  { href: "/admin/dashboard/customers", title: "Клієнти", active: false },
  { href: "/admin/dashboard/stock", title: "Склад", active: false },
] as const;

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
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

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex min-w-fit flex-col gap-4 overflow-y-auto bg-background p-6 text-sm font-medium [&>a:hover]:text-amber-600">
          {dashboardLinks.map((link) => {
            return link.active ? (
              <Link
                className={twMerge(path.includes(link.href) && "text-yellow-400 underline")}
                key={link.href}
                href={link.href}
              >
                {link.title}
              </Link>
            ) : (
              <span key={link.href} className="text-gray-600">
                {link.title}
              </span>
            );
          })}
        </aside>
        <div className="flex-1 overflow-y-auto">
          <Suspense>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
