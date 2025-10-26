import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "./globals.css";

import Header from "@/layout/Header/Header";
import Footer from "@/layout/Footer";
import Head from "next/head";

const fixelFont = localFont({
  src: "../fonts/FixelVariable.woff2",
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
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it-IT">
      <Head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="ON SMART" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={clsx(fixelFont.className, "flex min-h-svh flex-col")}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
