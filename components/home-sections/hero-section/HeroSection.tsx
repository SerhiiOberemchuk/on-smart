import Carousel from "./carousel/Carousel";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { JsonLd } from "@/lib/seo/JsonLd";
import { slidesBanners } from "@/types/main-page-hero-banners.data";
import type { ImageGallery, WithContext } from "schema-dts";

export default function HeroSection() {
  const imageGallery = slidesBanners.map((slide) =>
    slide.src.startsWith("http") ? slide.src : `${CONTACTS_ADDRESS.BASE_URL}${slide.src}`,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "OnSmart Hero Banners",
    description: "Banner promozionali principali della home page OnSmart.",
    image: imageGallery,
  } satisfies WithContext<ImageGallery>;

  return (
    <section id="hero" aria-label="Promozioni principali OnSmart">
      <p className="sr-only">
        Offerte e categorie in evidenza: scopri i sistemi di sicurezza, videosorveglianza e accessori
        professionali.
      </p>
      <Carousel />

      <JsonLd id="home_hero_images" data={jsonLd} />
    </section>
  );
}
