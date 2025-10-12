import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import clsx from "clsx";
import Header from "@/layout/Header";
const fixelFont = localFont({
  src: "../fonts/FixelVariable.woff2",
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
      </body>
    </html>
  );
}
