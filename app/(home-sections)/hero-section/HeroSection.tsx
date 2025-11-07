import Carousel from "./carousel/Carousel";
import { twMerge } from "tailwind-merge";

export default function HeroSection() {
  return (
    <section id="hero" className="">
      <div className={twMerge("container px-0")}>
        <Carousel />
      </div>
    </section>
  );
}
