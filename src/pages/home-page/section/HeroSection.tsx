import LinkCatalogo from "@/components/LinkCatalogo";
import Carousel from "./carousel/Carousel";

export default function HeroSection() {
  return (
    <section id="hero" className="relative">
      <div className="absolute top-0 left-0 z-10 pl-10">
        <h1 className="H1 mb-6">
          Proteggi ciò che ami <br /> con i nostri sistemi <br /> di videosorveglianza.
        </h1>
        <LinkCatalogo>Vai allo shop</LinkCatalogo>
      </div>
      <Carousel />
    </section>
  );
}
