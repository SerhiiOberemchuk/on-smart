import { Metadata } from "next";
import BrandSection from "@/components/home-sections/brand-section/BrandSection";
import CategorySection from "@/components/home-sections/categoty-section/CategorySection";
import FeedbackFormSection from "@/components/home-sections/feedback-form-section/FeedbackFormSection";
import GoogleReviewSection from "@/components/home-sections/google-review-section/GoogleReviewSection";
import HeroSection from "@/components/home-sections/hero-section/HeroSection";
import TopSalesSection from "@/components/home-sections/top-sales-section/TopSalesSection";
import Script from "next/script";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";

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
    canonical: `${CONTACTS_ADDRESS.BASE_URL}`,
  },
  openGraph: {
    title: "OnSmart — Elettronica & Sicurezza per la tua casa",
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
            legalName: CONTACTS_ADDRESS.OWNER.COMPANY_NAME,
            url: CONTACTS_ADDRESS.BASE_URL,
            logo: `${CONTACTS_ADDRESS.BASE_URL}/logo.png`,
            sameAs: ["https://www.facebook.com/onsmart", "https://www.instagram.com/onsmart"],
            address: {
              "@type": "PostalAddress",
              addressLocality: CONTACTS_ADDRESS.ADDRESS.CITY,
              addressRegion: CONTACTS_ADDRESS.ADDRESS.REGION,
              postalCode: CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE,
              addressCountry: CONTACTS_ADDRESS.ADDRESS.COUNTRY,
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: CONTACTS_ADDRESS.PHONE_NUMBER,
              contactType: "customer service",
              availableLanguage: "Italian",
            },
          }),
        }}
      />
    </>
  );
}
