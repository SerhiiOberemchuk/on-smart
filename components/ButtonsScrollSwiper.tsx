"use client";

import { ButtonArrow } from "@/components/ButtonArrows";

export default function ButtonsScrollSwiper({
  idNext,
  idPrev,
  className,
}: {
  idPrev: string;
  idNext: string;
  className?: string;
}) {
  return (
    <nav className={className}>
      <ButtonArrow direction="left" id={idPrev} />
      <ButtonArrow direction="right" id={idNext} />
    </nav>
  );
}
