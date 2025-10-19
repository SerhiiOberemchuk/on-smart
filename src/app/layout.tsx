import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "./globals.css";

import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

// export const dynamic = "force-static";

const fixelFont = localFont({
  src: "../fonts/FixelVariable.woff2",
  display: "auto",
  preload: true,
});

export const metadata: Metadata = {
  title: "OnSmart",
  description:
    "La videosorveglianza è uno dei modi più affidabili per proteggere la tua proprietà",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={clsx(fixelFont.className, "flex flex-col min-h-svh")}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
