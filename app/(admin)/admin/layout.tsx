import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "../../styles/globals.css";

import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ToastContainer } from "react-toastify";

const fixelFont = localFont({
  src: "../../../fonts/FixelVariable.woff2",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OnSmart Admin",
  description: "Pannello di amministrazione OnSmart",

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
      <body className={clsx(fixelFont.className, "flex min-h-svh flex-col")}>
        <NuqsAdapter>
          <main className="flex-1">
            <Suspense>{children}</Suspense>
          </main>
        </NuqsAdapter>
        <ToastContainer />
      </body>
    </html>
  );
}
