"use client";

import { signOutUser } from "@/app/actions/auth";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { dashboardLinks, type DashboardLinkIcon } from "./dashboard-admin.types";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "admin_sidebar_collapsed";

function SidebarItemIcon({ icon }: { icon: DashboardLinkIcon }) {
  switch (icon) {
    case "products":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="4" width="18" height="15" rx="2.5" />
          <path d="M3 10h18" />
          <path d="M8 14h3" />
        </svg>
      );
    case "brands":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 10V5.8A1.8 1.8 0 0 1 5.8 4h4.2l9 9-5 5-10-8Z" />
          <circle cx="8.2" cy="8.2" r="1.2" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="3" width="8" height="8" rx="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.8" />
        </svg>
      );
    case "characteristics":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <circle cx="9" cy="6" r="2" fill="currentColor" />
          <circle cx="15" cy="12" r="2" fill="currentColor" />
          <circle cx="8" cy="18" r="2" fill="currentColor" />
        </svg>
      );
    case "banners":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m6 17 4-4 3.2 3.2 2.3-2.3L18 17" />
        </svg>
      );
    case "stock":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M3 10h18v10H3z" />
          <path d="M5 10 9 4h6l4 6" />
          <path d="M8 14h8" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 4h14a2 2 0 0 1 2 2v14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M8 9h8M8 13h8M8 17h6" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18" />
          <path d="M8 15h4" />
        </svg>
      );
    default:
      return null;
  }
}

function MenuToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {isOpen ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

function CollapseToggleIcon({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {isCollapsed ? <path d="m10 6 6 6-6 6" /> : <path d="m14 6-6 6 6 6" />}
    </svg>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    (() => {
      setSidebarOpen(false);
    })();
  }, [path]);

  useEffect(() => {
    (() => {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      if (stored === "1") {
        setSidebarCollapsed(true);
      }
    })();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-icon-btn admin-mobile-toggle"
            aria-label={isSidebarOpen ? "Закрити навігацію" : "Відкрити навігацію"}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <MenuToggleIcon isOpen={isSidebarOpen} />
          </button>

          <Link href="/admin/dashboard" className="admin-brand">
            OnSmart Адмінка
          </Link>
        </div>

        <div className="admin-topbar-right">
          <form action={signOutUser}>
            <button type="submit" className="admin-logout-btn">
              Вийти
            </button>
          </form>
        </div>
      </header>

      <div className={clsx("admin-main", isSidebarCollapsed && "is-sidebar-collapsed")}>
        <button
          type="button"
          aria-label="Закрити навігацію"
          className={clsx("admin-backdrop", isSidebarOpen && "is-open")}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={clsx("admin-sidebar", isSidebarOpen && "is-open", isSidebarCollapsed && "is-collapsed")}>
          <div className="admin-sidebar-header">
            <button
              type="button"
              className="admin-icon-btn admin-sidebar-toggle"
              aria-label={isSidebarCollapsed ? "Розгорнути сайдбар" : "Згорнути сайдбар"}
              title={isSidebarCollapsed ? "Розгорнути сайдбар" : "Згорнути сайдбар"}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              <CollapseToggleIcon isCollapsed={isSidebarCollapsed} />
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            {dashboardLinks.map((link) => {
              const isActive = path === link.href || path.startsWith(link.href + "/");
              const baseClasses = clsx(
                "admin-sidebar-link",
                isActive && "admin-sidebar-link-active",
                !link.active && "admin-sidebar-link-disabled",
              );

              if (!link.active) {
                return (
                  <span
                    key={link.href}
                    className={baseClasses}
                    aria-disabled="true"
                    title={isSidebarCollapsed ? link.title : undefined}
                  >
                    <span className="admin-sidebar-link-icon" aria-hidden>
                      <SidebarItemIcon icon={link.icon} />
                    </span>
                    <span className="admin-sidebar-link-text">{link.title}</span>
                  </span>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={baseClasses}
                  aria-label={isSidebarCollapsed ? link.title : undefined}
                  title={isSidebarCollapsed ? link.title : undefined}
                >
                  <span className="admin-sidebar-link-icon" aria-hidden>
                    <SidebarItemIcon icon={link.icon} />
                  </span>
                  <span className="admin-sidebar-link-text">{link.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="admin-content">
          <Suspense>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
