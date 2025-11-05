"use client";

import { ButtonArrow } from "@/components/ButtonArrows";
import { useEffect, useRef, useState } from "react";

export default function ScrollButtons() {
  const listItem = useRef<HTMLElement | null>(null);
  const list = useRef<HTMLElement | null>(null);
  const [scrollAmount, setScrollAmount] = useState(0);

  useEffect(() => {
    listItem.current = document.getElementById("top-products-item");
    list.current = document.getElementById("top-products-list");
    if (listItem.current && list.current) {
      setScrollAmount(listItem.current.offsetWidth + 16);
    }
  }, [listItem, list]);
  const handleScroll = (direction: "left" | "right") => {
    if (list.current) {
      const scrollOptions: ScrollToOptions = {
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      };
      list.current.scrollBy(scrollOptions);
    }
  };
  return (
    <nav>
      <ButtonArrow direction="left" onClick={() => handleScroll("left")} />
      <ButtonArrow direction="right" onClick={() => handleScroll("right")} />
    </nav>
  );
}
