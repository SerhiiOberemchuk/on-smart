"use client";

import { useBear } from "../store/store-main";

export default function Con() {
  const { bears, increasePopulation } = useBear();

  return (
    <>
      <button type="button" onClick={() => increasePopulation()}>
        increasePopulation
      </button>
      <span>Beears{bears || "empty store"}</span>
    </>
  );
}
