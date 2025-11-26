import { Metadata } from "next";
import BrandSection from "./brand-section/BrandSection";
import CategorySection from "./(home-sections)/categoty-section/CategorySection";
import FeedbackFormSection from "./(home-sections)/feedback-form-section/FeedbackFormSection";
import GoogleReviewSection from "./(home-sections)/google-review-section/GoogleReviewSection";
import HeroSection from "./(home-sections)/hero-section/HeroSection";
import TopSalesSection from "./(home-sections)/top-sales-section/TopSalesSection";
import Script from "next/script";

export const metadata: Metadata = {
  title: "OnSmart — Elettronica, Videosorveglianza, Smart Home al miglior prezzo",
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
    canonical: "https://www.on-smart.it/",
  },
  openGraph: {
    title: "OnSmart — Elettronica & Sicurezza per la tua casa",
    description:
      "Camere di sicurezza, sistemi smart home, accessori e molto altro. I migliori prezzi e spedizione rapida.",
    url: "https://www.on-smart.it/",
    siteName: "OnSmart",
    images: [
      {
        url: "https://www.on-smart.it/og-image.png",
        width: 1200,
        height: 630,
        alt: "OnSmart - Electronics and Security",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

export default async function Home() {
  return (
    <>
      <HeroSection />
      <TopSalesSection />
      <CategorySection />
      <BrandSection />
      <GoogleReviewSection />
      <FeedbackFormSection />
      <Script
        id="home_page_main"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "OnSmart",
            legalName: "OnSmart S.r.l.s.",
            url: "https://www.on-smart.it/",
            logo: "https://www.on-smart.it/logo.png",
            sameAs: ["https://www.facebook.com/onsmart", "https://www.instagram.com/onsmart"],
            address: {
              "@type": "PostalAddress",
              addressLocality: "Avellino",
              addressRegion: "AV",
              postalCode: "83100",
              addressCountry: "IT",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+39 348 123 4567",
              contactType: "customer service",
              availableLanguage: "Italian",
            },
          }),
        }}
      />
    </>
  );
}
