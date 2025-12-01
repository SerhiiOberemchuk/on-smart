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
  // preload: true,
  fallback: ["system-ui", "Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "OnSmart", template: "%s | OnSmart" },
  description: "La videosorveglianza è uno dei modi più affidabili per proteggere la tua proprietà",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { title: "ON-SMART" },
  // manifest: "/site.webmanifest",
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
