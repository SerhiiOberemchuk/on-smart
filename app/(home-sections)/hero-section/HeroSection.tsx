import LinkCatalogo from "@/components/LinkCatalogo";
import Carousel from "./carousel/Carousel";
// import dynamic from "next/dynamic";
// import Image from "next/image";
// const Carousel = dynamic(() => import("./carousel/Carousel"), {
//   ssr: false,
//   loading: () => {
//     return (
//       <div className="relative w-full overflow-hidden">
//         <Image
//           src="/slider/slide1.webp"
//           alt="Proteggi ciò che ami con i nostri sistemi di videosorveglianza"
//           width={1440}
//           height={677}
//           priority
//           className="h-auto w-full object-cover"
//         />
//       </div>
//     );
//   },
// });

export default function HeroSection() {
  return (
    <section id="hero" className="relative">
      <div className="absolute top-[214px] left-0 z-10 pl-10">
        <h1 className="H1 mb-6">
          Proteggi ciò che ami <br /> con i nostri sistemi <br /> di videosorveglianza.
        </h1>
        <LinkCatalogo>Vai allo shop</LinkCatalogo>
      </div>
      <Carousel />
    </section>
  );
}
