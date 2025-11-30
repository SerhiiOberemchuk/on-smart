import Script from "next/script";
import Carousel from "./carousel/Carousel";
import { twMerge } from "tailwind-merge";

export default function HeroSection() {
  return (
    <section id="hero" className="">
      <div className={twMerge("container px-0")}>
        <Carousel />
      </div>
      <Script
        id="home_hero_images"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: "OnSmart Hero Banners",
            image: [
              "https://www.on-smart.it/hero-baner/Baner 1 Antifurto.png",
              "https://www.on-smart.it/hero-baner/Baner 2 Videosorveglianza.png",
              "https://www.on-smart.it/hero-baner/Baner 3 Gruppi di Continuità.png",
              "https://www.on-smart.it/hero-baner/Baner 4 Cavetteria e accessori.png",
            ],
          }),
        }}
      />
    </section>
  );
}
