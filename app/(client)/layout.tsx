import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "../styles/globals.css";

import Header from "@/layout-components/Header/Header";
import Footer from "@/layout-components/Footer";
import CardDialog from "@/components/ProductCard/dialog-add-to-cart/CardDialog";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ToastContainer } from "react-toastify";
import { ReactNode } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import CookieBanner from "@/components/cookie-consent/CookieBanner";

const fixelFont = localFont({
  src: "../../fonts/FixelVariable.woff2",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial"],
  adjustFontFallback: "Arial",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://on-smart.it"),
  title: { default: "OnSmart", template: "%s | OnSmart" },
  description:
    "OnSmart: videosorveglianza, antifurto, smart home e accessori professionali con spedizione rapida e supporto qualificato.",
  alternates: {
    canonical: "https://on-smart.it",
  },
  applicationName: "OnSmart",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { title: "ON-SMART" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "OnSmart",
    description:
      "Videosorveglianza, antifurto, smart home e accessori professionali per casa e azienda.",
    url: "https://on-smart.it",
    siteName: "OnSmart",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OnSmart: sistemi di sicurezza, videosorveglianza e smart home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnSmart",
    description:
      "Videosorveglianza, antifurto, smart home e accessori professionali per casa e azienda.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it-IT">
      <body className={clsx(fixelFont.className, "flex min-h-svh flex-col")}>
        <GoogleAnalytics gtagId={process.env.GOOGLE_GTAG} />
        <NuqsAdapter>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ClientErrorBoundary>
            <CardDialog />
          </ClientErrorBoundary>
          <CookieBanner />
        </NuqsAdapter>
        <ToastContainer />
      </body>
    </html>
  );
}
