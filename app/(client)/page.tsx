import { Metadata } from "next";
import BrandSection from "@/components/home-sections/brand-section/BrandSection";
import CategorySection from "@/components/home-sections/categoty-section/CategorySection";
import FeedbackFormSection from "@/components/home-sections/feedback-form-section/FeedbackFormSection";
import GoogleReviewSection from "@/components/home-sections/google-review-section/GoogleReviewSection";
import HeroSection from "@/components/home-sections/hero-section/HeroSection";
import TopSalesSection from "@/components/home-sections/top-sales-section/TopSalesSection";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildOnlineStoreJsonLd } from "@/lib/seo/store-structured-data";
import { Suspense } from "react";
import FallbackHeroSection from "@/components/home-sections/hero-section/FallbackHeroSection";
import {
  BrandSectionFallback,
  CategorySectionFallback,
  FeedbackFormSectionFallback,
  GoogleReviewSectionFallback,
  TopSalesSectionFallback,
} from "@/components/home-sections/fallbacks/HomeSectionFallbacks";
import type { WebSite, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Elettronica, videosorveglianza e smart home al miglior prezzo",
  description:
    "Acquista online elettronica, sistemi di videosorveglianza, smart home e accessori per la sicurezza. Consegna veloce, prezzi competitivi e supporto professionale.",
  keywords: [
    "videosorveglianza",
    "smart home",
    "telecamere",
    "allarmi casa",
    "elettronica",
    "domotica",
    "on smart",
    "on-smart",
  ],
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}`,
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "OnSmart - Elettronica e Sicurezza per la tua casa",
    description:
      "Camere di sicurezza, sistemi smart home, accessori e molto altro. I migliori prezzi e spedizione rapida.",
    url: CONTACTS_ADDRESS.BASE_URL,
    siteName: "OnSmart",
    images: [
      {
        url: `${CONTACTS_ADDRESS.BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "OnSmart - Electronics and Security",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnSmart - Elettronica e Sicurezza per la tua casa",
    description:
      "Camere di sicurezza, sistemi smart home, accessori e molto altro. I migliori prezzi e spedizione rapida.",
    images: [`${CONTACTS_ADDRESS.BASE_URL}/og-image.png`],
  },
};

function HomePageFallback() {
  return (
    <>
      <h1 className="sr-only">
        OnSmart: elettronica, videosorveglianza, sistemi smart home e sicurezza per casa e azienda
      </h1>
      <FallbackHeroSection />
      <TopSalesSectionFallback />
      <CategorySectionFallback />
      <BrandSectionFallback />
      <GoogleReviewSectionFallback />
      <FeedbackFormSectionFallback />
    </>
  );
}

async function HomeContent() {
  const onlineStoreJsonLd = buildOnlineStoreJsonLd();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OnSmart",
    url: CONTACTS_ADDRESS.BASE_URL,
    inLanguage: "it-IT",
  } satisfies WithContext<WebSite>;

  return (
    <>
      <h1 className="sr-only">
        OnSmart: elettronica, videosorveglianza, sistemi smart home e sicurezza per casa e azienda
      </h1>
      <Suspense fallback={<FallbackHeroSection />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<TopSalesSectionFallback />}>
        <TopSalesSection />
      </Suspense>
      <Suspense fallback={<CategorySectionFallback />}>
        <CategorySection />
      </Suspense>
      <Suspense fallback={<BrandSectionFallback />}>
        <BrandSection />
      </Suspense>
      <Suspense fallback={<GoogleReviewSectionFallback />}>
        <GoogleReviewSection />
      </Suspense>
      <Suspense fallback={<FeedbackFormSectionFallback />}>
        <FeedbackFormSection />
      </Suspense>
      <JsonLd id="home_page_main" data={onlineStoreJsonLd} />
      <JsonLd id="home_page_website" data={websiteJsonLd} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomeContent />
    </Suspense>
  );
}
