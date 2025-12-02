import Script from "next/script";
import Carousel from "./carousel/Carousel";
import { twMerge } from "tailwind-merge";
import LinkYellow from "@/components/YellowLink";
import { slidesBanners } from "@/types/main-page-hero-banners.data";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero">
      <div className={twMerge("relative container h-[677px] px-0")}>
        <div className="absolute inset-0 z-9">
          <div className="title_home_carousel px-4 md:max-w-[60%] md:pl-10">
            <h2 className="H1 mb-6 text-pretty text-white">{slidesBanners[0].title}</h2>
            <LinkYellow href="/catalogo" title="Vai allo shop" />
          </div>
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/50"></div>
          <Image
            src={slidesBanners[0].src}
            width={1440}
            height={677}
            alt={slidesBanners[0].title}
            priority={true}
            loading={"eager"}
            className="mx-auto h-[677px] object-cover object-center"
          />
        </div>
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
