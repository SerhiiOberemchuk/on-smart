"use client";

import { useBear } from "@/store/store-main";
import { useEffect } from "react";

export default function Con() {
  const { bears, increasePopulation } = useBear();
  useEffect(() => {
    console.log("Render Con element");
  });
  return (
    <>
      <button type="button" onClick={() => increasePopulation()}>
        increasePopulation
      </button>
      <span>Beears{bears || "empty store"}</span>
    </>
  );
}
