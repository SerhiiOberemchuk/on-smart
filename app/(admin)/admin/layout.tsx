import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "../../styles/globals.css";
import "./admin-theme.css";

import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
// import AdminSessionWatcher from "./auth/AdminSessionWatcher";

const fixelFont = localFont({
  src: "../../../fonts/FixelVariable.woff2",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OnSmart Адмінка",
  description: "Адміністративна панель OnSmart",

  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk-UA">
      <body className={clsx(fixelFont.className, "admin-body")}>
        <main className="admin-root">
          <Suspense>{children}</Suspense>
        </main>
        <ToastContainer />
        {/* <AdminSessionWatcher /> */}
      </body>
    </html>
  );
}
