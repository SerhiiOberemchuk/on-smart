import { slidesBanners } from "@/types/main-page-hero-banners.data";
import Image from "next/image";

export default function FallbackHeroSection() {
  return (
    <div className="h-[580px] md:h-[677px]">
      <Image
        src={slidesBanners[0].src}
        width={1440}
        height={677}
        alt={slidesBanners[0].title}
        priority
        fetchPriority="high"
        loading="eager"
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="mx-auto h-[580px] object-cover object-bottom md:h-[677px] md:object-center"
      />
    </div>
  );
}
