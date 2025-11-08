"use client";

import { ButtonArrow } from "@/components/ButtonArrows";
import { useCustomButtonSwiper } from "@/utils/useCustomButtonSwiper";

export default function ButtonsScrollSwiper({ id }: { id: string }) {
  const { handleNext, handlePrev } = useCustomButtonSwiper(id);

  return (
    <nav>
      <ButtonArrow direction="left" onClick={handlePrev} />
      <ButtonArrow direction="right" onClick={handleNext} />
    </nav>
  );
}
