import Script from "next/script";
import Carousel from "./carousel/Carousel";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { slidesBanners } from "@/types/main-page-hero-banners.data";

export default function HeroSection() {
  const imageGallery = slidesBanners.map((slide) =>
    slide.src.startsWith("http") ? slide.src : `${CONTACTS_ADDRESS.BASE_URL}${slide.src}`,
  );

  return (
    <section id="hero" aria-label="Promozioni principali OnSmart">
      <p className="sr-only">
        Offerte e categorie in evidenza: scopri i sistemi di sicurezza, videosorveglianza e accessori
        professionali.
      </p>
      <Carousel />

      <Script
        id="home_hero_images"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: "OnSmart Hero Banners",
            description: "Banner promozionali principali della home page OnSmart.",
            image: imageGallery,
          }),
        }}
      />
    </section>
  );
}
